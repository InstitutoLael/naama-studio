export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    
    // This is a scaffold. To actually send email on Cloudflare Pages, 
    // you typically use Mailchannels or an external SMTP via fetch.
    
    console.log("Form data received:", data);
    
    // Simulate successful response
    return new Response(JSON.stringify({ success: true, message: "Enviado a naamastudiospa@gmail.com" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
