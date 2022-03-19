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

    const [ping_form, setPingFormData] = useState({
        host: host || "",
    });
    const handlePingFormInput = (e) => {
        const { id, name, value } = e.target;
        const key = name !== "" ? name : id;

        setPingFormData({ ...ping_form, [key]: value });
    };

    const handlePingFormSubmit = (e) => {
        e.preventDefault();
        toggleLoading(true);
        setReachable(null);
        setData(null);

        axios.get(`/api/ping`, { params: ping_form, timeout: 1000 * 60 }).then(({ data }) => {
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
            <h1 className="fw-bold">Ping</h1>
            <p className="lead">A tool to test if host and port are public and open.</p>
        </hgroup>
        <div className="container-fluid d-flex flex-column gap-3 px-3">
            <form onSubmit={handlePingFormSubmit}>
                <fieldset className="row g-2">
                    <div className="col-md-8 col-lg-4 d-flex flex-column gap-2">
                        <div className="input-group">
                            <span className="input-group-text"><i className="fal fa-globe" /></span>
                            <input type="search" name="host" id="input-host" value={ping_form.host ?? ''} onChange={handlePingFormInput} className="form-control" placeholder="Host" required autoFocus={true} autoComplete="off" autoCorrect="off" autoCapitalize="off" />

                            <button type="submit" className={`btn btn-${is_reachable === true ? "success" : is_reachable === false ? "danger" : "primary"} px-3`} disabled={loading}>
                                Test {loading && <i className="fal fa-spinner-third fa-spin" />}
                                {is_reachable === true && <i className="fal fa-check"></i>}
                                {is_reachable === false && <i className="fal fa-times"></i>}
                            </button>
                        </div>

                        {data &&
                            <div className="card border p-2">
                                <ul className="list-unstyled">
                                    <li>Protocol: {data.protocol}</li>
                                    <li>Host: {data.host}</li>
                                    <li>Port: {data.port}</li>
                                    <li>Reachable: {is_reachable === true ? "Yes" : is_reachable === false ? "No" : "Unknown"}</li>
                                </ul>
                            </div>
                        }
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
    return { props: props };
};