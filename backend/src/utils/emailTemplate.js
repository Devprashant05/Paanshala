export const baseEmailTemplate = ({
    title,
    subtitle,
    body,
    highlight,
    footerNote,
}) => {
    const logoUrl =
        "https://res.cloudinary.com/dj4snfkzf/image/upload/v1770011267/paan-500_wrptiy.png";

    return `
  <div style="max-width:540px;margin:auto;font-family:Inter,Arial,sans-serif;background:#fff7e6;padding:22px;">
    <div style="background:#ffffff;border-radius:14px;overflow:hidden;border:2px solid #c9a24d;">
      
      <!-- Logo -->
      <div style="text-align:center;padding:18px 0 10px;">
        <img 
          src="${logoUrl}" 
          alt="Paanshala"
          width="160"
          style="display:block;margin:auto;"
        />
      </div>

      <!-- Header -->
      <div style="
        background:linear-gradient(135deg,#7a1f2b,#9c2d3a);
        padding:22px;
        text-align:center;
        color:#fff7e6;
      ">
        <h2 style="margin:0;font-size:22px;letter-spacing:0.4px;">
          ${title}
        </h2>
        ${
            subtitle
                ? `<p style="margin:6px 0 0;font-size:14px;opacity:0.95;">
                    ${subtitle}
                  </p>`
                : ""
        }
      </div>

      <!-- Body -->
      <div style="
        padding:28px;
        color:#2b1a12;
        font-size:15px;
        line-height:1.6;
        text-align:center;
      ">
        ${body}

        ${
            highlight
                ? `<div style="
                    margin:24px 0;
                    padding:18px;
                    background:#fff3d6;
                    border:2px dashed #e28b2d;
                    border-radius:10px;
                  ">
                    <span style="
                      font-size:26px;
                      letter-spacing:6px;
                      font-weight:700;
                      color:#2f6b3c;
                    ">
                      ${highlight}
                    </span>
                  </div>`
                : ""
        }

        ${footerNote || ""}
      </div>

      <!-- Footer -->
      <div style="
        background:#f3e6c9;
        padding:16px;
        text-align:center;
        font-size:12px;
        color:#5c3a1e;
      ">
        © ${new Date().getFullYear()} <b>Paanshala</b> · Royal Taste · Fresh Tradition
      </div>

    </div>
  </div>
  `;
};
