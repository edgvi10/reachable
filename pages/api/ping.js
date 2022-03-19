import isReachable from "is-reachable";

export default async function (req, res) {
    console.clear();
    console.log(`${req.method} ${req.url}`);

    const response = {};
    response.success = false;
    response.message = "";

    if (req.method === "GET") {
        const params = req.query;
        if (!params.host) {
            response.message = "Missing host parameter";
            res.status(400).json(response);
        }

        let url_parts = params.host.split("://").reverse();
        const protocol = url_parts[1] || "http";
        const [host, url_port] = url_parts[0].split(":");
        var port = params.port || url_port;

        if (!port && protocol === "https") port = 443;
        if (!port && (protocol === "http" || protocol === "ws")) port = 80;
        if (!port && protocol === "mysql") port = 3306;

        response.target = { protocol, host, port };

        await isReachable(`${protocol}://${host}:${port}`).then(reachable => {
            response.reachable = reachable;
            response.success = true;
        }).catch(err => {
            console.log(err);
            response.message = err.message;
        });

        return res.status(response.statusCode || 200).json({ ...response });
    }

    return res.status(405).json({ ...response, error: "Method Not Allowed" });
}