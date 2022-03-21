import axios from "axios";
import router from "next/router";
import NProgress from 'nprogress';
import { useState } from "react";

router.onRouteChangeStart = () => NProgress.start();
router.onRouteChangeComplete = () => NProgress.done();
router.onRouteChangeError = () => NProgress.done();

export default function HomePage({ host, ...props }) {
    // const router = useRouter();
    const [loading, toggleLoading] = useState(false);
    const [is_reachable, setReachable] = useState(null);
    const [data, setData] = useState(null);

    const [reachable_form, setReachableFormData] = useState({});
    const handleReachableFormInput = (e) => {
        const { id, name, value } = e.target;
        const key = name !== "" ? name : id;

        setReachableFormData({ ...reachable_form, [key]: value });
    };

    const handleReachableFormSubmit = (e) => {
        e.preventDefault();
        toggleLoading(true);
        setReachable(null);
        setData(null);

        axios.get(`/api/reachable`, { params: reachable_form, timeout: 1000 * 60 }).then(({ data }) => {
            console.log(data);
            setData(data.target);
            setReachable(data.reachable);
        }).catch(err => {
            console.log(err);
            setReachable(false);
        }).finally(() => {
            toggleLoading(false);
        });
    };

    return <main className="d-flex flex-column flex-fill gap-3">
        <hgroup className="container-fluid p-3 bg-primary text-light">
            <h1 className="fw-bold">Openport</h1>
            <p className="lead">A tool to test if host and port are public.</p>
        </hgroup>
        <div className="container-fluid d-flex flex-column gap-3 px-3">
            <form onSubmit={handleReachableFormSubmit}>
                <fieldset className="row g-2">
                    <div className="col-md-8 col-lg-4 d-flex flex-column gap-2">
                        <div className="input-group">
                            <span className="input-group-text"><i className="fal fa-network-wired" /></span>
                            <input type="search" name="host" id="input-host" value={reachable_form.host ?? ''} onChange={handleReachableFormInput} className="form-control" placeholder="Host" required autoFocus={true} autoComplete="off" autoCorrect="off" autoCapitalize="off" />

                            <button type="submit" className={`btn btn-${is_reachable === true ? "success" : is_reachable === false ? "danger" : "primary"} px-3`} disabled={loading}>
                                <b>try</b> {loading && <i className="fal fa-spinner-third fa-spin" />}
                                {is_reachable === true && <i className="fal fa-check"></i>}
                                {is_reachable === false && <i className="fal fa-times"></i>}
                            </button>
                        </div>

                        {data &&
                            <div className="card border p-2">
                                <ul className="list-unstyled">
                                    <li>Reachable: {is_reachable === true ? "Yes" : is_reachable === false ? "No" : "Unknown"}</li>
                                    <li>Protocol: {data.protocol}</li>
                                    <li>Host: {data.host}</li>
                                    <li>Port: {data.port}</li>
                                    <li>Ping: {data.time || "*"}ms</li>
                                </ul>
                            </div>
                        }

                        <div className="card border p-2">
                            <h2 className="h4 fw-bold">How to use:</h2>
                            <p>Type <code>protocol://host:port</code> to test if is reachable. Some protocol points to default port numbers: <small className="text-muted">(click to use)</small></p>
                            <ul className="list-inline d-flex flex-row gap-1 flex-wrap">
                                {props.protocols && Object.keys(props.protocols).map((protocol) => <li key={protocol} className="btn btn-outline-primary btn-sm p-0 px-1" onClick={() => setReachableFormData({ ...reachable_form, host: `${protocol}://` })}>{protocol}: <code className="text-info">{props.protocols[protocol]}</code></li>)}
                            </ul>
                        </div>
                    </div>
                </fieldset>
            </form>
        </div>
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