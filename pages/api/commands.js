async function ApiPage(req, res) {
    let secretApi = process.env.SECRET_API;

    fetch(secretApi+'/commands').then(async (body) => {
        res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');

        res.json({
            time: +new Date(),
            commands: await body.json()
        })
    }).catch((err) => {
        res.json({ error: err.type })
    });
}

export default ApiPage;