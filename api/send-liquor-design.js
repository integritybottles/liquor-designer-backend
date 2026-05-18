import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const config = {
  api: {
    bodyParser: { sizeLimit: "1mb" }
  }
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const {
      name,
      email,
      phone,
      productType,
      dimensions,
      itemStyle,
      designDescription,
      finish,
      engraving,
      generatedImage,
      referenceImages
    } = req.body;

    let imageSection = "";
    if (generatedImage) {
      imageSection += `<p><b>Generated Design:</b><br><img src="${generatedImage}" width="200"/></p>`;
    }

    let referenceSection = "";
    if (referenceImages && Array.isArray(referenceImages) && referenceImages.length > 0) {
      referenceSection = "<h2>Reference Images</h2>";
      referenceImages.forEach(url => {
        referenceSection += `<p><img src="${url}" width="200"/></p>`;
      });
    } else {
      referenceSection = "<h2>Reference Images</h2><p>None provided</p>";
    }

    // Format display strings based on product type
    let dimensionsDisplay = dimensions;
    let styleDisplay = itemStyle;
    let finishDisplay = finish || "standard";

    if (productType === 'custom') {
      dimensionsDisplay = "Custom (see description)";
      styleDisplay = "Custom (see description)";
      finishDisplay = "Custom (see description)";
    }

    const html = `
      <h2>Customer Information</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> ${phone}</p>

      <h2>Design Details</h2>
      <p><b>Product Type:</b> ${productType === 'liquor-glasses' ? 'Liquor Glasses' : productType === 'liquor-bottles' ? 'Liquor Bottles' : 'Custom'}</p>
      <p><b>Dimensions / Capacity:</b> ${dimensionsDisplay}</p>
      <p><b>Style / Shape:</b> ${styleDisplay}</p>
      <p><b>Finish / Colour:</b> ${finishDisplay}</p>
      <p><b>Engraving:</b> ${engraving === "yes" ? "Yes (laser engraved)" : "No (printed)"}</p>
      <p><b>Design Description:</b> ${designDescription}</p>

      <h2>Generated Image</h2>
      ${imageSection}

      ${referenceSection}
    `;

    await resend.emails.send({
      from: "Liquor Designer <onboarding@resend.dev>",
      to: "your-team@integritybottles.com", // CHANGE THIS to your actual email
      subject: `New ${productType} Design Request from ${name}`,
      html,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Email sending failed" });
  }
}