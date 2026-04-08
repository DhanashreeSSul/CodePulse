export async function POST() {
    const response = Response.json({ success: true });
    response.headers.set(
        'Set-Cookie',
        `token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
    );
    return response;
}
