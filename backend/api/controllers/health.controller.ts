export async function healthController(): Promise<Response> {
  return new Response(
    JSON.stringify({
      ok: true,
      service: "smart-stock-savvy",
      time: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    },
  );
}
