import { useState } from "react";

import ChannelList from "./ChannelList";
import ChatWindow from "./ChatWindow";

import "./community.scss";

const channels = [
  {
    id: "general",
    name: "General",
    description: "General FiTrack Club discussions",
  },
  {
    id: "training",
    name: "Training",
    description: "Workouts, running plans and training",
  },
  {
    id: "nutrition",
    name: "Nutrition",
    description: "Food, hydration and nutrition",
  },
  {
    id: "gear",
    name: "Gear",
    description: "Shoes, watches and running gear",
  },
  {
    id: "help",
    name: "Help",
    description: "Questions and technical help",
  },
];

export default function CommunityPage() {
  const [activeChannel, setActiveChannel] = useState("general");

  return (
    <main className="community-page">
      {/* <div className="community-page__header">
        <span className="club-section-label">
          FiTrack CLUB
        </span>

        <h1>Community</h1>

        <p>
          Connect with runners, share your experience
          and talk about running.
        </p>
      </div> */}

      <div className="community-layout">
        <ChannelList
          channels={channels}
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
        />

        <ChatWindow
          channelId={activeChannel}
          channel={channels.find((item) => item.id === activeChannel)}
        />
      </div>
    </main>
  );
}
