// functions/api/contact.js
export async function onRequest(context) {
  // 1. 只接受 POST 请求
  if (context.request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // 2. 解析表单数据
    let formData;
    const contentType = context.request.headers.get('content-type');
    if (contentType.includes('application/json')) {
      formData = await context.request.json();
    } else {
      const form = await context.request.formData();
      formData = Object.fromEntries(form.entries());
    }

    // 3. 提取字段
    const { name, email, phone, company, subject, message } = formData;

    // 简单验证
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: '请填写所有带 * 的字段' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. 发送邮件（使用 Resend）
    const RESEND_API_KEY = context.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: '服务器配置错误：缺少 API Key' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const emailResult = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',   // 测试用，正式上线后改为你的验证域名
        to: ['mark.w@lerextrading.com'],
        reply_to: email,
        subject: `[网站联系表单] ${subject}`,
        html: `
          <h2>来自网站的询盘</h2>
          <p><strong>姓名：</strong> ${name}</p>
          <p><strong>邮箱：</strong> ${email}</p>
          <p><strong>电话/WhatsApp：</strong> ${phone || '未填写'}</p>
          <p><strong>公司：</strong> ${company || '未填写'}</p>
          <p><strong>主题：</strong> ${subject}</p>
          <p><strong>留言：</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      })
    });

    if (!emailResult.ok) {
      const errorText = await emailResult.text();
      console.error('Resend error:', errorText);
      return new Response(JSON.stringify({ error: '邮件发送失败，请稍后重试' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 5. 成功：重定向到感谢页
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/thanks.html'
      }
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}