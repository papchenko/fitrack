import { Link } from "react-router-dom";
import "./recordButton.scss";

/** Brand-inspired record mark. Opens activity selection at /step. */
export default function RecordButton() {
    return (
        <Link
            to="/step"
            className="ft-record-cta ft-record-cta--compact"
            aria-label="Record activity"
            title="Record activity"
        >
            <span className="ft-record-cta__symbol" aria-hidden="true">
                <span className="ft-record-cta__disc" />
            </span>
        </Link>
    );
}
