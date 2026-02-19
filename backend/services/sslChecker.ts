import tls from 'tls';
import https from 'https';
import { URL } from 'url';

interface SSLCheckResult {
    chain: any[];
    expiry: string | null;
    issuer: string | null;
    subject: string | null;
    protocol: string | null;
    cipher: string | null;
    grade: string;
    issues: string[];
    valid: boolean;
    daysRemaining: number;
}

export const checkSSL = (targetUrl: string, detailed: boolean): Promise<SSLCheckResult> => {
    return new Promise((resolve, reject) => {
        try {
            // Ensure protocol is present
            if (!targetUrl.startsWith('http')) {
                targetUrl = 'https://' + targetUrl;
            }

            const parsedUrl = new URL(targetUrl);
            const hostname = parsedUrl.hostname;
            const port = parsedUrl.port || '443';

            const options = {
                host: hostname,
                port: parseInt(port),
                rejectUnauthorized: false, // We want to check even if invalid, to report why
                servername: hostname, // SNI
            };

            const socket = tls.connect(options, () => {
                const cert = socket.getPeerCertificate(true); // Get detailed cert with chain
                const protocol = socket.getProtocol();
                const cipher = socket.getCipher();

                socket.end();

                if (!cert || Object.keys(cert).length === 0) {
                    reject(new Error('No certificate found'));
                    return;
                }

                // Processing
                const validFrom = new Date(cert.valid_from);
                const validTo = new Date(cert.valid_to);
                const now = new Date();
                const daysRemaining = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                const issues: string[] = [];
                let grade = 'A';

                // Grading logic
                if (daysRemaining < 0) {
                    issues.push('Certificate has expired');
                    grade = 'F';
                } else if (daysRemaining < 30) {
                    issues.push('Certificate expires in less than 30 days');
                    if (grade < 'C') grade = 'C'; // Downgrade to at most C if not already worse
                }

                if (protocol && (protocol === 'TLSv1' || protocol === 'TLSv1.1')) {
                    issues.push(`Weak protocol: ${protocol}. Upgrade to TLS 1.2 or 1.3`);
                    grade = 'F';
                }

                // Issuer
                const issuer = typeof cert.issuer === 'object' ? (cert.issuer as any).O || (cert.issuer as any).CN : String(cert.issuer);
                const subject = typeof cert.subject === 'object' ? (cert.subject as any).CN : String(cert.subject);

                // Chain (simplified for now, just main cert info + issuer)
                // In detailed mode, we could walk cert.issuerCertificate
                const chain: any[] = [];
                let currentCert = cert;
                if (detailed) {
                    // Traverse chain if available (node-forge might be better for full chain parsing if we had raw DER, 
                    // but for now we stick to simple TLS info)
                    // Note: getPeerCertificate(true) returns the cert with issuerCertificate property
                    let depth = 0;
                    while (currentCert && depth < 5) {
                        chain.push({
                            subject: (currentCert.subject as any).CN,
                            issuer: (currentCert.issuer as any).CN,
                            valid_to: currentCert.valid_to,
                            fingerprint: currentCert.fingerprint
                        });
                        if (currentCert.issuerCertificate && currentCert.issuerCertificate !== currentCert) {
                            currentCert = currentCert.issuerCertificate;
                        } else {
                            break;
                        }
                        depth++;
                    }
                }

                resolve({
                    chain,
                    expiry: validTo.toISOString(),
                    issuer,
                    subject,
                    protocol,
                    cipher: cipher ? `${cipher.name} (${cipher.version})` : null,
                    grade,
                    issues,
                    valid: daysRemaining > 0,
                    daysRemaining
                });
            });

            socket.on('error', (err) => {
                reject(err);
            });

            socket.setTimeout(5000, () => {
                socket.destroy();
                reject(new Error('Connection timed out'));
            });

        } catch (e) {
            reject(e);
        }
    });
};
