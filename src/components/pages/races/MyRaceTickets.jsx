import { useEffect, useState } from "react";

import { useAuth } from "../../account/AuthContext";

import { getMyTickets } from "./raceService";

import RaceTicketModal from "./RaceTicketModal";

import { FaCheckCircle } from "react-icons/fa";

import "./myRaceTickets.scss";

const MyRaceTickets = () => {
  const { user } = useAuth();

  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    if (!user) return;

    loadTickets();
  }, [user]);

  const loadTickets = async () => {
    try {
      setLoading(true);

      const data = await getMyTickets(user.uid);

      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="my-race-tickets">

      <h5 className="mb-3 text-white">
        My Race Tickets
      </h5>

      <p className="text-warning mb-4">
        Your registrations and QR tickets.
      </p>

      {loading && (
        <div className="text-center py-3">

          <div
            className="spinner-border text-light"
            role="status"
          />

        </div>
      )}

      {!loading && tickets.length === 0 && (
        <div className="empty-state">

          <h6>No tickets yet</h6>

          <p>
            Register for a race to receive your ticket.
          </p>

        </div>
      )}

      {!loading && tickets.length > 0 && (

        <div className="tickets-grid">

          {tickets.map((ticket) => (

            <div
              key={ticket.id}
              className="ticket-card"
            >

              <h5 className="text-success">{ticket.raceTitle}</h5>

              <p>

                <strong>Category:</strong>{" "}

                {ticket.category}

              </p>

              <p>

                <strong>Status:</strong>{" "}

                {ticket.checkedIn ? (
                  <span className="text-success">
                    <FaCheckCircle /> Checked In
                  </span>
                ) : (
                  <span className="text-warning">
                    Waiting
                  </span>
                )}

              </p>

              <button
                className="btn btn-custome w-100"
                onClick={() => setSelectedTicket(ticket)}
              >
                View QR Ticket
              </button>

            </div>

          ))}

        </div>

      )}

      {selectedTicket && (

        <RaceTicketModal
          ticket={selectedTicket}
          close={() => setSelectedTicket(null)}
        />

      )}

    </div>
  );
};

export default MyRaceTickets;