import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Certificates folder — /backend/certificates/
const CERT_DIR = path.join(__dirname, '..', 'certificates');

// Golden Skills logo path — actual site logo (JPEG from assets folder)
const LOGO_PATH = path.join(__dirname, '..', 'certificates', 'golden-logo.jpeg');

if (!fs.existsSync(CERT_DIR)) {
  fs.mkdirSync(CERT_DIR, { recursive: true });
}

/**
 * Generate a professional PDF certificate matching the Golden Skills design
 * @param {Object} options
 * @param {string} options.userName       - Student name
 * @param {string} options.courseTitle    - Course/Plan title
 * @param {string} options.category       - premium / pro / lite
 * @param {string} options.completionDate - ISO date string
 * @param {string} options.certId         - Unique cert ID (MongoDB _id)
 * @returns {Promise<{filename, filepath}>}
 */
export const generateCertificate = async (options) => {
  const { userName, courseTitle, category, completionDate, certId } = options;

  const filename = `cert_${certId}.pdf`;
  const filepath = path.join(CERT_DIR, filename);

  // Format date — DD-MM-YYYY
  const dateObj = new Date(completionDate);
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  const formattedDate = `${dd}-${mm}-${yyyy}`;

  // Category label
  const categoryLabel = {
    premium: 'Premium',
    pro: 'Pro',
    lite: 'Lite'
  }[category] || category;

  return new Promise((resolve, reject) => {
    try {
      // A4 landscape
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 0
      });

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      const W = doc.page.width;   // 841.89
      const H = doc.page.height;  // 595.28

      // ── BACKGROUND ───────────────────────────────────────────────
      // Dark navy background
      doc.rect(0, 0, W, H).fill('#C9A84C');

      // ── OUTER BORDER ─────────────────────────────────────────────
      const borderPad = 18;
      doc.rect(borderPad, borderPad, W - borderPad * 2, H - borderPad * 2)
        .lineWidth(2)
        .strokeColor('#0d1b3e')
        .stroke();

      // ── LEFT SIDE BULLET DOTS ────────────────────────────────────
      const dotX = 10;
      const dotStartY = 40;
      const dotSpacing = 22;
      const dotCount = 23;
      for (let i = 0; i < dotCount; i++) {
        const y = dotStartY + i * dotSpacing;
        if (y > H - 40) break;
        doc.circle(dotX, y, 2.5).fill('#7a5c00');
      }

      // ── RIGHT SIDE BULLET DOTS ───────────────────────────────────
      const dotXR = W - 10;
      for (let i = 0; i < dotCount; i++) {
        const y = dotStartY + i * dotSpacing;
        if (y > H - 40) break;
        doc.circle(dotXR, y, 2.5).fill('#7a5c00');
      }

      // ── OUTER BORDER (dark on gold) ───────────────────────────────
      // (already drawn above, but update stroke if needed)

      // ── TOP RIGHT: "CERTIFICATE" ──────────────────────────────────
      doc.font('Helvetica-Bold')
        .fontSize(52)
        .fillColor('#0d1b3e')
        .text('CERTIFICATE', 0, 45, {
          align: 'right',
          width: W - 40
        });

      // ── "OF APPRECIATION" ────────────────────────────────────────
      doc.font('Helvetica-Bold')
        .fontSize(16)
        .fillColor('#5a3e00')
        .text('OF APPRECIATION', 0, 110, {
          align: 'right',
          width: W - 40
        });

      // ── "THIS CERTIFICATE PROUDLY PRESENTED TO" ──────────────────
      doc.font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#0d1b3e')
        .text('THIS CERTIFICATE PROUDLY PRESENTED TO', 0, 148, {
          align: 'center',
          characterSpacing: 1
        });

      // ── USER NAME (large script-style italic) ─────────────────────
      doc.font('Helvetica-BoldOblique')
        .fontSize(48)
        .fillColor('#0d1b3e')
        .text(userName, 0, 175, {
          align: 'center'
        });

      // ── NAME UNDERLINE ────────────────────────────────────────────
      const nameY = 235;
      const nameLineW = 320;
      doc.moveTo(W / 2 - nameLineW / 2, nameY)
        .lineTo(W / 2 + nameLineW / 2, nameY)
        .lineWidth(1)
        .strokeColor('#0d1b3e')
        .stroke();

      // ── DESCRIPTION TEXT ─────────────────────────────────────────
      const descText =
        `IN APPRECIATION OF YOUR SELFLESS DEDICATION AND UNWAVERING\n` +
        `SUPPORT. THIS ACHIEVEMENT IS A REFLECTION OF YOUR HARD WORK,\n` +
        `DEDICATION AND COMMITMENT TO THE ${courseTitle.toUpperCase()} (${categoryLabel.toUpperCase()} PLAN).\n` +
        `YOU CAN BE PROUD OF THIS ACCOMPLISHMENT.`;

      doc.font('Helvetica')
        .fontSize(10.5)
        .fillColor('#0d1b3e')
        .text(descText, 80, 250, {
          align: 'center',
          width: W - 160,
          lineGap: 3,
          characterSpacing: 0.5
        });

      // ── BOTTOM SECTION ────────────────────────────────────────────
      const bottomY = H - 160;

      // ── DATE (left) ───────────────────────────────────────────────
      const dateColX = 140;
      doc.font('Helvetica-Bold')
        .fontSize(14)
        .fillColor('#0d1b3e')
        .text(formattedDate, dateColX - 60, bottomY, {
          width: 160,
          align: 'center'
        });

      // Date underline
      doc.moveTo(dateColX - 50, bottomY + 22)
        .lineTo(dateColX + 90, bottomY + 22)
        .lineWidth(1)
        .strokeColor('#0d1b3e')
        .stroke();

      // "DATE" label
      doc.font('Helvetica')
        .fontSize(9)
        .fillColor('#5a3e00')
        .text('DATE', dateColX - 60, bottomY + 30, {
          width: 160,
          align: 'center',
          characterSpacing: 2
        });

      // ── GS LOGO CIRCLE (center) ───────────────────────────────────
      const logoSize = 72;  // width & height
      const logoX = W / 2 - logoSize / 2;
      const logoY = bottomY - logoSize / 2 + 15;

      // Draw actual Golden Skills logo image
      if (fs.existsSync(LOGO_PATH)) {
        doc.image(LOGO_PATH, logoX, logoY, {
          width: logoSize,
          height: logoSize
        });
      } else {
        // Fallback: drawn circle if image missing
        doc.circle(W / 2, logoY + logoSize / 2, logoSize / 2).fill('#C9A84C');
        doc.font('Helvetica-Bold').fontSize(22).fillColor('#0d1b3e')
          .text('GS', W / 2 - 12, logoY + logoSize / 2 - 13);
      }

      // Cert ID below logo
      doc.font('Helvetica')
        .fontSize(7)
        .fillColor('#5a3e00')
        .text(`ID: GS-${certId.toString().slice(-8).toUpperCase()}`, 0, logoY + logoSize + 5, {
          align: 'center'
        });

      // ── SIGNATURE (right) ─────────────────────────────────────────
      const sigColX = W - 300;
      doc.font('Helvetica-BoldOblique')
        .fontSize(26)
        .fillColor('#0d1b3e')
        .text('Golden Skills', sigColX, bottomY - 5, {
          width: 220,
          align: 'center'
        });

      // Signature underline
      doc.moveTo(sigColX + 10, bottomY + 28)
        .lineTo(sigColX + 210, bottomY + 28)
        .lineWidth(1)
        .strokeColor('#0d1b3e')
        .stroke();

      // "SIGNATURE" label
      doc.font('Helvetica')
        .fontSize(9)
        .fillColor('#5a3e00')
        .text('SIGNATURE', sigColX, bottomY + 36, {
          width: 220,
          align: 'center',
          characterSpacing: 2
        });

      doc.end();

      stream.on('finish', () => {
        resolve({ filename, filepath });
      });

      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Delete a certificate file
 */
export const deleteCertificate = (filename) => {
  try {
    const filepath = path.join(CERT_DIR, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (err) {
    console.error('Delete certificate error:', err.message);
  }
};
