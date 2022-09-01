
import axios from "axios";
import isReachable from "is-reachable";

export default async function (req, res) {
    console.clear();
    console.log(`${req.method} ${req.url}`);

    // get user agent ip
    const user_ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    var response = {};
    response.success = false;
    response.message = "";

    if (req.method === "GET") {
        const params = { ...req.query, ...req.body };
        if (!params.host) {
            response.message = "Missing host parameter";
            res.status(400).json(response);
        }

        let url_parts = params.host.split("://").reverse();
        const protocol = url_parts[1] || "http";
        const [host, url_port] = url_parts[0].split(":");
        var port = params.port || url_port;

        if (!port) port = protocols[protocol] || 80;

        response.target = { protocol, host, port, user_ip };
        console.log(response.target);

        const protocols = {};
        try {
            const request_protocols_gist = await axios.get("https://api.github.com/gists/e073b0eabfd21dca35e4517a470f69f5");
            const request_protocols_gist_data = request_protocols_gist.data;

            if (request_protocols_gist_data.files) {
                const request_protocols = request_protocols_gist_data.files["protocols.ini"].content;
                if (request_protocols) {
                    request_protocols.split("\n").map(line => {
                        const [key, value] = line.split("=");
                        protocols[key] = value;
                    });
                }
            }
        } catch (error) {
            console.log("Error while fetching protocols");
            console.log(error.message);
        }

        try {
            console.log(`Checking ${protocol}://${host}:${port}`);
            const test_url = `${protocol}://${host}:${port}`;
            const reachable_request = await isReachable(`${test_url}`);
            response.reachable = reachable_request;
            response.success = true;

            if (response.reachable) {
                var time = new Date().getTime();
                await isReachable(`${protocol}://${host}:${port}/`).finally(() => {
                    time = new Date().getTime() - time;
                    response.target.time = time;
                });
            }

            try {
                const user_provider_request = await axios.get(`https://ip-api.com/json/${user_ip}`);
                const user_provider_reponse = user_provider_request.data;
                user_provider_reponse.ip = user_provider_reponse.query;
                response.target.user_provider = user_provider_reponse;
            } catch (error) {
                console.log("Error while fetching user provider");
                console.log(error.message);
            }

            try {
                const target_provider_request = await axios.get(`http://ip-api.com/json/${host}`, { timeout: 1000 * 30 });
                const target_provider_response = target_provider_request.data;
                target_provider_response.ip = target_provider_response.query;
                response.target = { ...response.target, ...target_provider_response };

            } catch (error) {
                console.log("Error while fetching ip");
                console.log(error.message);
            }
        } catch (error) {
            console.log("Error while checking reachability");
            console.log(error.message);
            response.message = error.message;
            response.statusCode = 404;
        }

        console.log(response);
        return res.status(response.statusCode || 200).json({ ...response });
    }

    return res.status(405).json({ ...response, error: "Method Not Allowed" });
}
