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

        const protocols = {};

        const request_protocols_gist = await (await fetch("https://api.github.com/gists/e073b0eabfd21dca35e4517a470f69f5")).json();
        if (request_protocols_gist.files) {
            const request_protocols = request_protocols_gist.files["protocols.ini"].content;
            if (request_protocols) {
                request_protocols.split("\n").map(line => {
                    const [key, value] = line.split("=");
                    protocols[key] = value;
                });
            }
        }

        let url_parts = params.host.split("://").reverse();
        const protocol = url_parts[1] || "http";
        const [host, url_port] = url_parts[0].split(":");
        var port = params.port || url_port;

        if (!port) port = protocols[protocol] || 80;

        response.target = { protocol, host, port };


        await isReachable(`${protocol}://${host}:${port}`).then(reachable => {
            response.reachable = reachable;
            response.success = true;
        }).catch(err => {
            console.log(err);
            response.message = err.message;
        });

        if (response.reachable) {
            var time = new Date().getTime();
            await isReachable(`${protocol}://${host}:${port}/`).finally(() => {
                time = new Date().getTime() - time;
                response.target.time = time;
            });
        }

        return res.status(response.statusCode || 200).json({ ...response });
    }

    return res.status(405).json({ ...response, error: "Method Not Allowed" });
}