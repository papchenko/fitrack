export default function ChannelList({
  channels,
  activeChannel,
  onChannelChange,
}) {
  return (
    <aside className="channel-list">
      <div className="channel-list__header">
        <span>CHANNELS</span>
      </div>

      <div className="channel-list__items">
        {channels.map((channel) => (
          <button
            key={channel.id}
            type="button"
            className={`channel-item ${
              activeChannel === channel.id ? "active" : ""
            }`}
            onClick={() => onChannelChange(channel.id)}>
            <span className="channel-item__hash">#</span>

            <span className="channel-item__name">{channel.name}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
