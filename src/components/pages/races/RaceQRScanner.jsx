import { useEffect, useRef, useState } from "react";

import { Html5Qrcode } from "html5-qrcode";

import { toast } from "react-toastify";

import { getTicketByQR, checkInTicket } from "./raceService";

const RaceQRScanner = ({ race, close }) => {
  const scannerRef = useRef(null);

  const scanner = useRef(null);

  const [loading, setLoading] = useState(true);

  const [busy, setBusy] = useState(false);

  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);
  /*
==========================================
START CAMERA
==========================================
*/

  const startScanner = async () => {
    try {
      scanner.current = new Html5Qrcode("race-scanner");

      await scanner.current.start(
        {
          facingMode: "environment",
        },

        {
          fps: 10,

          qrbox: {
            width: 260,
            height: 260,
          },
        },

        onScanSuccess,

        () => {},
      );

      setLoading(false);
    } catch (err) {
      console.error(err);

      toast.error("Cannot access camera.");

      setLoading(false);
    }
  };
  /*
==========================================
STOP CAMERA
==========================================
*/

  const stopScanner = async () => {
    try {
      if (scanner.current) {
        await scanner.current.stop();

        await scanner.current.clear();

        scanner.current = null;
      }
    } catch (err) {
      console.error(err);
    }
  };
  /*
==========================================
SCAN SUCCESS
==========================================
*/

  const onScanSuccess = async (decodedText) => {
    if (busy) return;

    setBusy(true);

    try {
      const data = await getTicketByQR(decodedText);

      /*
        another race?
        */

      if (data.raceId !== race.id) {
        toast.error("This ticket belongs to another race.");

        setBusy(false);

        return;
      }
      if (data.checkedIn) {
        setBusy(true);

        await stopScanner();

        setTicket(data);

        return;
      }

      /*
Waiting
*/

      await stopScanner();

      setTicket(data);
    } catch (err) {
      console.error(err);

      toast.error("Invalid QR Ticket.");

      setTimeout(() => {
        setBusy(false);
      }, 1500);
    }
  };
  /*
==========================================
CHECK IN
==========================================
*/

  const handleCheckIn = async () => {
    if (!ticket) return;

    try {
      await checkInTicket(ticket.id);

      toast.success("Runner checked in.");
      setTicket({
        ...ticket,

        checkedIn: true,

        status: "checked",

        checkedInAt: {
          seconds: Math.floor(Date.now() / 1000),
        },
      });
    } catch (err) {
      console.error(err);

      toast.error("Check-In failed.");
    }
  };

  const scanNextRunner = async () => {
    setTicket(null);

    setBusy(false);

    startScanner();
  };

  const handleClose = async () => {
    await stopScanner();

    close();
  };

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-modal">
        <div
          className="
            d-flex
            justify-content-between
            align-items-center
            mb-4
            ">
          <div>
            <h3>Race Check-In</h3>

            <p className="text-secondary">{race.title}</p>
          </div>

          <button className="btn-close btn-close-white" onClick={handleClose} />
        </div>

        {!ticket && (
          <>
            <div id="race-scanner" className="scanner" />

            {loading && (
              <div className="text-center py-4">
                <div className="spinner-border text-light" />

                <p className="mt-3">Starting camera...</p>
              </div>
            )}
          </>
        )}
        {ticket && (
          <div className="runner-card">
            <div className="text-center">
              <img
                src={
                  ticket.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt=""
                style={{
                  width: 90,

                  height: 90,

                  borderRadius: "50%",

                  objectFit: "cover",
                }}
              />

              <h3 className="mt-3">{ticket.username}</h3>

              <p>{ticket.email}</p>
            </div>

            <hr />

            <div className="runner-info">
              <p>
                <strong>Category</strong> {ticket.category}
              </p>

              <p>
                <strong>Registered</strong>{" "}
                {ticket.registeredAt?.seconds
                  ? new Date(
                      ticket.registeredAt.seconds * 1000,
                    ).toLocaleString()
                  : "-"}
              </p>
              <p>
                <strong>Status</strong>{" "}
                {ticket.checkedIn ? (
                  <span className="badge bg-success">Already Checked In</span>
                ) : (
                  <span className="badge bg-warning text-dark">Waiting</span>
                )}
              </p>
            </div>

            <div className="d-flex gap-2 mt-4">
              {ticket.checkedIn ? (
                <button className="btn btn-success flex-fill" disabled>
                  Already Checked In
                </button>
              ) : (
                <button
                  className="btn btn-success flex-fill"
                  onClick={handleCheckIn}>
                  Confirm Check-In
                </button>
              )}

              <button
                className="btn btn-custome flex-fill"
                onClick={scanNextRunner}>
                Scan Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaceQRScanner;
