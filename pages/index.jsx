import axios from "axios";
import router from "next/router";
import NProgress from 'nprogress';
import { useEffect, useState } from "react";

router.onRouteChangeStart = () => NProgress.start();
router.onRouteChangeComplete = () => NProgress.done();
router.onRouteChangeError = () => NProgress.done();

export default function HomePage({ host, ...props }) {
    // const router = useRouter();
    const [loading, toggleLoading] = useState(false);
    const [is_reachable, setReachable] = useState(null);
    const [data, setData] = useState(null);

    const [reachable_form, setReachableFormData] = useState({ port: 80, host: host });
    const handleReachableFormInput = (e) => {
        const { id, name, value } = e.target;
        const key = name !== "" ? name : id;

        setReachableFormData({ ...reachable_form, [key]: value });
    };

    const handleReachableFormSubmit = async (e) => {
        try {
            e.preventDefault();
            toggleLoading(true);
            setReachable(null);
            setData(null);
            
            var response_data = {};
            
            const request_ip = await axios.get(`http://ip-api.com/json/${reachable_form.host}`,{ timeout: 1000 * 30 });
            const request_ip_data = request_ip.data;
            console.log(request_ip_data);

            const request_reachable = await axios.get(`/api/reachable`, { params: reachable_form, timeout: 1000 * 30 });
            const request_reachable_data = request_reachable.data;
            console.log(request_reachable_data);
            
            response_data = { ...request_reachable_data.target, ...request_ip_data };
            
            setData(response_data);
            setReachable(request_reachable_data.reachable);
        } catch (error) {
            console.log(error.message);
            setReachable(false);
        } finally {
            toggleLoading(false);
        }
    };

    const [favorites, setFavorites] = useState([]);
    const saveFavorite = () => {
        toggleLoading(true);
        const exists = favorites.find(f => f.host === reachable_form.host && f.port === reachable_form.port);
        if (!exists) {
            favorites.push({ host: reachable_form.host, port: reachable_form.port });
            localStorage.setItem("favorites", JSON.stringify(favorites));

            setFavorites(favorites);
        }
        setTimeout(() => {
            toggleLoading(false);
        }, 300);
    };

    const removeFavorite = (favorite) => {
        toggleLoading(true);
        const new_favorites = favorites.filter(f => f.host !== favorite.host || f.port !== favorite.port);
        localStorage.setItem("favorites", JSON.stringify(new_favorites));
        setFavorites(new_favorites);
        setTimeout(() => {
            toggleLoading(false);
        }, 300);
    };

    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem("favorites"));
        setFavorites(favorites || []);
    }, [])

    return <main className="bg-light h-100">
        <hgroup className="container-fluid py-3 bg-primary text-light">
            <h1 className="fw-bold">Openport</h1>
            <p className="lead">A tool to test if host and port are public and reachable.</p>
        </hgroup>
        <section className="container-fluid py-3">
            <div className="row g-3">
                <form onSubmit={handleReachableFormSubmit} className="col-12 col-md-4">
                    <fieldset className="d-flex flex-column gap-2">
                        <div className="row g-2">
                            <div className="col-12 col-md-9">
                                <div className="input-group">
                                    <input type="search" name="host" id="input-host" value={reachable_form.host ?? ''} onChange={handleReachableFormInput} className="form-control" placeholder="Host" required autoFocus={true} autoComplete="off" autoCorrect="off" autoCapitalize="off" />
                                </div>
                            </div>

                            <div className="col-3">
                                <input type="tel" inputMode="numeric" name="port" id="input-port" value={reachable_form.port ?? 80} onChange={handleReachableFormInput} placeholder="port" required autoComplete="off" className="form-control" />
                            </div>

                            <div className="col-9 col-md-12 ms-auto text-end ms-md-0 text-md-start d-flex flex-row gap-1">
                                <button type="submit" className={`btn btn-${is_reachable === true ? "success" : is_reachable === false ? "danger" : "primary"} w-100 px-3`} disabled={loading}>
                                    <b>Try</b> {loading && <i className="fal fa-spinner-third fa-spin" />}
                                    {is_reachable === true && <i className="fal fa-check"></i>}
                                    {is_reachable === false && <i className="fal fa-times"></i>}
                                </button>
                            </div>
                        </div>

                        {data &&
                            <div className="card border p-2">
                                <ul className="list-unstyled">
                                    <li>Reachable: {is_reachable === true ? <b className="badge bg-success">YES</b> : is_reachable === false ? <b className="badge bg-danger">NO</b> : "Unknown"}</li>
                                    <li>Host: {data.host}</li>
                                    <li>IP: {data.ip ? data.ip : ""}</li>
                                    <li>Port: {data.port}</li>
                                    {data.time && <li>Ping: <b className={`${data.time < 100 ? "text-success" : data.time < 300 ? "text-warning" : "text-danger"}`}>{data.time}ms</b></li>}
                                    <li>ISP: {data.isp ? data.isp : "Unknown"}</li>
                                </ul>

                                <button type="button" className="btn btn-info" onClick={saveFavorite}><b>Save</b> <i className="fal fa-heart" /></button>
                            </div>
                        }
                    </fieldset>
                </form>

                <div className="col-12 col-md-4">
                    <div className="card border">
                        <header className="p-3">
                            <h2 className="h4 fw-bold">How to use:</h2>
                            <p>Type <code>host</code> and <code>port</code> to test if is reachable. Some protocol points to default port numbers: <small className="text-muted">(click to use)</small></p>
                        </header>

                        <ul className="list-inline d-flex flex-row gap-2 flex-wrap p-3">
                            {props.protocols && Object.keys(props.protocols).map((protocol) => <li key={protocol} className="btn btn-outline-primary btn-sm p-0 px-1" onClick={() => setReachableFormData({ ...reachable_form, port: props.protocols[protocol] })}><code className="text-info">{props.protocols[protocol]}</code> {protocol}</li>)}
                        </ul>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="card border d-flex flex-column gap-2">
                        <header className="p-2">
                            <h2 className="h4 fw-bold">Favorites</h2>
                            <p className="text-muted">Save local for tests</p>
                        </header>

                        <table className="table table-sm table-hover small border-top">
                            <tbody>
                                {favorites.map((favorite) => {
                                    let icon = "fal fa-heart";
                                    if (favorite.port == 443) icon = "fal fa-lock";
                                    else if (favorite.port == 80) icon = "fal fa-globe";
                                    else if (favorite.port == 22) icon = "fal fa-terminal";
                                    else if (favorite.port == 3306) icon = "fal fa-database";

                                    return <tr key={favorite.host + favorite.port} onClick={() => { setReachableFormData(favorite); }}>
                                        <td className="align-middle ps-2"><i className={icon} /> {favorite.host}</td>
                                        <td className="text-end align-middle">{favorite.port}</td>
                                        <td className="text-end">
                                            <button type="button" className="btn btn-danger btn-sm" onClick={() => removeFavorite(favorite)}><i className="fal fa-trash-alt"></i></button>
                                        </td>
                                    </tr>
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    </main>
}

export const getServerSideProps = async (ctx) => {
    //get client host
    const props = {};
    const host = ctx.req.headers['x-forwarded-for'] || ctx.req.connection.remoteAddress;
    props.host = host || null;

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

    props.protocols = protocols;

    return { props: props };
};
