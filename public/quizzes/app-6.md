# App 6: Realtime AI Collaboration — Quiz Questions

Each question has four options. Only one is correct (marked with **bold**).

---

**1. What library does the Realtime AI Collaboration app use for bidirectional real-time communication?**
- A) ws (native WebSockets)
- B) Pusher
- **C) Socket.IO**
- D) Server-Sent Events

? Real-time communication libraries enable instant data exchange between clients and servers without the client needing to repeatedly poll for updates. Bidirectional communication means both sides can initiate messages at any time, unlike unidirectional protocols where only the server pushes data. Different libraries offer varying levels of abstraction, fallback mechanisms, and features like rooms, namespaces, and automatic reconnection on top of raw transport protocols.

> [Socket.IO](https://socket.io/) provides bidirectional, event-based communication between the client and server. Unlike SSE (which is server-to-client only), Socket.IO enables both directions — users can send messages and receive AI updates in real time. It includes automatic reconnection, room-based broadcasting, and fallback to HTTP long-polling when WebSockets are unavailable.

**2. What does "human-in-the-loop" mean in the context of this AI application?**
- A) A human must manually start each AI request
- B) A human reviews the code that builds the AI system
- **C) The AI pauses at certain decision points and requires human approval or input before proceeding**
- D) A human writes the prompts that the AI uses

? Human-in-the-loop (HITL) is a design pattern for AI systems where the level of human involvement in automated workflows is a deliberate architectural decision. It addresses the question of how much autonomy to give an AI system — fully autonomous operation is faster but riskier, while requiring human involvement at key points adds latency but improves safety, accuracy, and accountability, especially for high-stakes or irreversible actions.

> Human-in-the-loop (HITL) is a pattern where the AI system defers to a human for critical decisions, reviews, or approvals before taking action. In this application, when the AI proposes changes, edits, or actions, it can pause and broadcast a request for human approval via Socket.IO. The human reviews the proposal and either approves, rejects, or modifies it before the system continues. This is essential for high-stakes actions where AI errors are costly.

**3. What Socket.IO concept is used to broadcast AI updates only to users working on the same project?**
- A) Namespaces
- **B) Rooms**
- C) Channels
- D) Topics

? When multiple groups of users are connected to the same server simultaneously, the application needs a way to send targeted messages to specific subsets of connected clients rather than broadcasting to everyone. Real-time communication frameworks provide different organizational abstractions — grouping mechanisms that let the server direct messages to relevant recipients only, reducing noise and protecting data isolation between groups.

> [Socket.IO rooms](https://socket.io/docs/v4/rooms/) are arbitrary groupings of sockets. When a user joins a project, their socket joins that project's room (e.g., `project:123`). Events like AI responses, approval requests, and status updates are broadcast to the room, so only users in that project receive them. Rooms are server-side only — clients cannot join rooms directly, they must request it through an event handler.

**4. How does Socket.IO handle a client that temporarily loses internet connectivity?**
- A) The connection is permanently closed and must be manually reestablished
- B) Messages are lost and the client starts fresh
- **C) Socket.IO automatically attempts to reconnect with exponential backoff**
- D) The server queues messages indefinitely until the client returns

? Network connections are inherently unreliable — users move between WiFi networks, go through tunnels, or experience temporary outages. A real-time communication library needs a strategy for handling these interruptions gracefully. The reconnection behavior determines whether the application recovers automatically or requires user intervention, and whether any data is preserved or lost during the disconnection period.

> Socket.IO's client library includes built-in [automatic reconnection](https://socket.io/docs/v4/client-options/#reconnection) with configurable exponential backoff. When the connection drops, the client attempts to reconnect at increasing intervals. Once reconnected, the application can re-sync state (e.g., re-joining rooms and fetching missed updates). Note that messages sent during disconnection are not automatically replayed — the application must handle this gap.

**5. What transport does Socket.IO attempt first by default before upgrading?**
- A) WebSockets first, then falls back to HTTP Long Polling if unavailable
- B) WebSockets only, with no fallback
- **C) HTTP Long Polling first, then upgrades to WebSockets**
- D) Server-Sent Events first, then upgrades to WebSockets

? Transport protocols are the underlying mechanisms used to exchange data between client and server. WebSockets provide a persistent, full-duplex connection, while HTTP long polling simulates real-time by holding HTTP requests open until data is available. The order in which a library attempts these transports affects both the initial connection reliability (some network environments block certain protocols) and the eventual performance once a connection is established.

> Socket.IO's default behavior starts with [HTTP long polling](https://socket.io/docs/v4/how-it-works/) and then upgrades to WebSockets once the WebSocket handshake succeeds. This "polling first" strategy ensures the connection works even in restrictive network environments (corporate proxies, load balancers that do not support WebSockets). You can configure it to start with WebSockets directly via the `transports` option, but the default is more resilient.
