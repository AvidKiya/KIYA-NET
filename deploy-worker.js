/**
 * KIYA-NET One-Click Deploy Worker
 * 
 * Deploy this Worker to Cloudflare Workers.
 * It will automatically create Pages, D1, and R2 for your project.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname === "/") {
      return new Response(getHTML(), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (url.pathname === "/deploy" && request.method === "POST") {
      try {
        const body = await request.json();
        const { token, githubRepo, projectName } = body;
        
        if (!token || !githubRepo) {
          return json({ error: "توکن و آدرس گیت‌هاب الزامی است" }, 400);
        }

        const result = await deployProject(token, githubRepo, projectName || "kiya-net");
        return json(result);
      } catch (error) {
        return json({ error: error.message }, 500);
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};

async function deployProject(apiToken, githubRepo, projectName) {
  const headers = {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };

  const results = {
    steps: [],
    success: true,
    pagesUrl: "",
    d1Id: "",
    r2Name: "",
  };

  try {
    // 1. Create Pages Project
    results.steps.push("در حال ایجاد پروژه Pages...");
    const pagesRes = await fetch("https://api.cloudflare.com/client/v4/pages/projects", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: projectName,
        production_branch: "main",
        build_config: {
          build_command: "npm run build",
          destination_dir: ".vercel/output/static",
        },
      }),
    });
    const pagesData = await pagesRes.json();
    if (!pagesData.success) throw new Error("خطا در ایجاد Pages Project");
    results.pagesUrl = `https://${projectName}.pages.dev`;
    results.steps.push("✅ پروژه Pages ایجاد شد");

    // 2. Create D1 Database
    results.steps.push("در حال ایجاد دیتابیس D1...");
    const d1Res = await fetch("https://api.cloudflare.com/client/v4/d1/database", {
      method: "POST",
      headers,
      body: JSON.stringify({ name: `${projectName}-db` }),
    });
    const d1Data = await d1Res.json();
    if (d1Data.result) {
      results.d1Id = d1Data.result.uuid;
      results.steps.push("✅ دیتابیس D1 ایجاد شد");
    }

    // 3. Create R2 Bucket
    results.steps.push("در حال ایجاد باکت R2...");
    const r2Res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${await getAccountId(apiToken)}/r2/buckets`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: `${projectName}-files` }),
    });
    if (r2Res.ok) {
      results.r2Name = `${projectName}-files`;
      results.steps.push("✅ باکت R2 ایجاد شد");
    }

    results.success = true;
    results.message = "پروژه با موفقیت راه‌اندازی شد!";
    return results;

  } catch (error) {
    results.success = false;
    results.error = error.message;
    return results;
  }
}

async function getAccountId(apiToken) {
  const res = await fetch("https://api.cloudflare.com/client/v4/accounts", {
    headers: { Authorization: `Bearer ${apiToken}` },
  });
  const data = await res.json();
  return data.result[0].id;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getHTML() {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deploy خودکار کیا نت</title>
  <style>
    body { font-family: system-ui; background: #0a0a0a; color: #fff; padding: 40px; max-width: 700px; margin: 0 auto; }
    .card { background: #111; padding: 30px; border-radius: 16px; border: 1px solid #333; }
    input, button { width: 100%; padding: 14px; margin: 8px 0; border-radius: 12px; border: 1px solid #333; background: #1a1a1a; color: #fff; }
    button { background: #21F1A8; color: #000; font-weight: bold; cursor: pointer; }
    .log { background: #1a1a1a; padding: 20px; border-radius: 12px; margin-top: 20px; font-family: monospace; white-space: pre-line; }
    .success { color: #21F1A8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Deploy خودکار کیا نت</h1>
    <p>این ابزار تمام تنظیمات Cloudflare را به صورت خودکار انجام می‌دهد.</p>
    
    <form id="deployForm">
      <input type="password" id="token" placeholder="Cloudflare API Token" required>
      <input type="text" id="repo" placeholder="آدرس گیت‌هاب (مثال: username/KIYA-NET)" required>
      <input type="text" id="name" placeholder="نام پروژه (پیش‌فرض: kiya-net)" value="kiya-net">
      <button type="submit">شروع Deploy خودکار</button>
    </form>

    <div id="result" style="display:none;"></div>
  </div>

  <script>
    document.getElementById('deployForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const token = document.getElementById('token').value;
      const repo = document.getElementById('repo').value;
      const name = document.getElementById('name').value || 'kiya-net';
      
      const resultDiv = document.getElementById('result');
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = '<div class="log">در حال Deploy...</div>';
      
      try {
        const res = await fetch('/deploy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, githubRepo: repo, projectName: name })
        });
        
        const data = await res.json();
        
        if (data.success) {
          resultDiv.innerHTML = \`
            <div class="log success">
              ✅ Deploy با موفقیت انجام شد!<br><br>
              \${data.steps.join('<br>')}<br><br>
              🌐 آدرس سایت: <a href="\${data.pagesUrl}" target="_blank">\${data.pagesUrl}</a><br>
              🗄️ D1 ID: \${data.d1Id}<br>
              🪣 R2: \${data.r2Name}
            </div>
          \`;
        } else {
          resultDiv.innerHTML = \`<div class="log">❌ خطا: \${data.error}</div>\`;
        }
      } catch (err) {
        resultDiv.innerHTML = \`<div class="log">❌ خطا در ارتباط: \${err.message}</div>\`;
      }
    });
  </script>
</body>
</html>`;
}
