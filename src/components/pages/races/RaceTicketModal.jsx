import { QRCodeCanvas } from "qrcode.react";

import "./raceTicketModal.scss";

const RaceTicketModal = ({ ticket, close }) => {
  if (!ticket) return null;

  return (
    <div className="ticket-overlay">
      <div className="ticket-modal">

        <button
          className="ticket-close"
          onClick={close}
        >
          &times;
        </button>

        <h2 className="text-success">{ticket.raceTitle}</h2>

        <p className="ticket-subtitle">
          Official Race Ticket
        </p>

        <div className="ticket-qr">

          <QRCodeCanvas
            value={ticket.qrToken}
            size={240}
            level="H"
            includeMargin
          />

        </div>

        <div className="ticket-info text-white">

          <div>
            <span>Runner: </span>

            <strong>{ticket.username}</strong>
          </div>

          <div>
            <span>Email: </span>

            <strong>{ticket.email}</strong>
          </div>

          <div>
            <span>Category: </span>

            <strong>{ticket.category}</strong>
          </div>
                    <div>
            <span>Registration: </span>

            <strong>
              {ticket.registeredAt?.seconds
                ? new Date(
                    ticket.registeredAt.seconds * 1000
                  ).toLocaleString()
                : "-"}
            </strong>
          </div>

          <div>
            <span className="text-warning">Status: </span>

            <strong
              className={
                ticket.checkedIn
                  ? "status checked"
                  : "status waiting"
              }
            >
              {ticket.checkedIn
                ? "Checked In"
                : "Waiting"}
            </strong>
          </div>

        </div>

        <div className="ticket-footer">

          <p>
            Show this QR code to the organizer before the race starts.
          </p>

        </div>

      </div>
    </div>
  );
};

export default RaceTicketModal;