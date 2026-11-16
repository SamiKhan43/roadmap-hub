# Architecture Library
## Understand the Systems Behind Software

Go beyond writing code. Understand how computers execute programs, manage memory, schedule tasks, communicate over networks, store data, and coordinate distributed systems.

The Architecture Library teaches the fundamental concepts behind modern software systems, regardless of programming language, framework, or technology.

---

# Learning Categories

## 1. Computer & Operating System Fundamentals

Learn how computers work and how operating systems manage hardware and software.

### Module 1: Computer Fundamentals
- How Computers Work
- CPU and CPU Cores
- RAM, ROM, and Storage
- CPU vs RAM vs Storage
- Bits, Bytes, and Binary
- How Programs Are Executed
- Machine Code and Instructions
- 32-bit vs 64-bit Architecture
- What Is an Operating System?
- Kernel vs User Space
- Hardware vs Software

### Module 2: Memory Management
- What Is Memory?
- How Programs Use Memory
- Memory Allocation and Deallocation
- Stack Memory vs Heap Memory
- Static vs Dynamic Memory
- Variables, References, and Pointers
- Value vs Reference Semantics
- Garbage Collection
- Reference Counting
- Memory Leaks
- Memory Fragmentation
- Virtual Memory
- Paging and Swapping
- Memory Limits and Memory Sharing

### Module 3: Operating Systems and Processes
- What Is an Operating System?
- Program vs Process
- Process Lifecycle
- Process States
- Process Creation and Termination
- Process Isolation
- Parent and Child Processes
- Process Scheduling
- Context Switching
- System Calls
- Signals
- Environment Variables
- File Descriptors
- Standard Input, Output, and Error
- Inter-Process Communication (IPC)
- Pipes and Shared Memory
- Message Passing

---

## 2. Execution, Concurrency & Runtime Internals

Understand how programs execute, perform multiple tasks, and manage concurrent operations.

### Module 4: Threads and Concurrency
- What Is a Thread?
- Process vs Thread
- Main Thread
- Single-Threaded vs Multithreaded Programs
- Thread Lifecycle
- Thread Scheduling
- Context Switching
- Concurrency vs Parallelism
- CPU-Bound vs I/O-Bound Tasks
- Race Conditions
- Critical Sections
- Locks and Mutexes
- Semaphores
- Deadlocks
- Starvation
- Thread Pools
- Thread Safety
- Shared Mutable State

### Module 5: Asynchronous Programming and Non-Blocking I/O
- Synchronous vs Asynchronous Programming
- Blocking vs Non-Blocking Operations
- What Is Asynchronous I/O?
- Event-Driven Programming
- Event Loops
- Async and Await
- Coroutines
- Tasks and Futures
- Promises and Callbacks
- Cooperative Multitasking
- Concurrency vs Parallelism in Async Systems
- I/O Multiplexing
- Timeouts and Cancellation
- Backpressure

### Module 6: Runtime and Language Internals
- What Is a Runtime?
- Compiled vs Interpreted Languages
- Ahead-of-Time (AOT) Compilation
- Just-in-Time (JIT) Compilation
- Bytecode
- Virtual Machines
- Language Runtime Environments
- Garbage Collector Internals
- Memory Models
- Runtime Scheduling
- Exception Handling
- Resource Management
- Runtime Performance

---

## 3. Networking, Communication & Data

Understand how backend applications communicate, receive requests, and store information.

### Module 7: Networking Fundamentals
- What Is a Computer Network?
- Client-Server Architecture
- IP Addresses
- Public vs Private IP Addresses
- Ports
- DNS and Domain Resolution
- TCP vs UDP
- TCP Handshake
- Network Sockets
- Packets and Routing
- HTTP and HTTPS
- TLS and Secure Communication
- HTTP Versions
- WebSockets
- Latency vs Bandwidth
- Network Timeouts
- Connection Pooling

### Module 8: Backend Request Lifecycle
- What Happens When You Enter a URL?
- How DNS Resolution Works
- How a Network Connection Is Established
- What Is a Load Balancer?
- Reverse Proxy
- Web Server vs Application Server
- Request Routing
- Middleware
- Authentication vs Authorization
- Request Validation
- Business Logic
- Database Interaction
- Serialization and Deserialization
- Error Handling
- Response Delivery
- Complete Backend Request Lifecycle

### Module 9: Database and Storage Internals
- What Is a Database?
- Relational vs Non-Relational Databases
- Database Engines
- Tables, Rows, and Columns
- Primary Keys and Foreign Keys
- Database Indexes
- How B-Trees Work
- Database Transactions
- ACID Properties
- Transaction Isolation Levels
- Database Locks
- Multi-Version Concurrency Control (MVCC)
- Query Execution
- Query Optimization
- Database Connection Pooling
- Database Replication
- Database Sharding
- Data Consistency

---

## 4. System Architecture, Performance & Reliability

Learn how large-scale systems are designed, scaled, monitored, and kept reliable.

### Module 10: Distributed Systems
- What Is a Distributed System?
- Monolithic vs Distributed Architecture
- Vertical vs Horizontal Scaling
- Stateless vs Stateful Services
- Load Balancing
- Service Discovery
- Communication Between Services
- Message Queues
- Publish/Subscribe Architecture
- Event-Driven Architecture
- Eventual Consistency
- CAP Theorem
- Distributed Transactions
- Idempotency
- Retries in Distributed Systems
- Fault Tolerance
- Data Replication
- Consensus Algorithms

### Module 11: Resource Management and Performance
- CPU Utilization
- Memory Utilization
- Disk I/O
- Network Utilization
- Resource Allocation
- Resource Contention
- Thread Pools and Connection Pools
- Caching
- Cache Invalidation
- Latency and Throughput
- Response Time
- Performance Bottlenecks
- Profiling
- Load Testing
- Memory Leaks in Production
- Performance Optimization
- Rate Limiting
- Backpressure

### Module 12: Reliability and Fault Tolerance
- Failure vs Error
- What Is Fault Tolerance?
- Graceful Degradation
- System Availability
- Health Checks
- Timeouts
- Retry Strategies
- Exponential Backoff
- Circuit Breakers
- Bulkhead Pattern
- Graceful Shutdown
- Backups and Recovery
- Disaster Recovery
- Logging
- Monitoring
- Distributed Tracing
- Observability

---

# Lesson Structure

Every topic should follow a consistent lesson format.

Each lesson should include:

1. **Definition** — Explain the concept in simple language.
2. **Mental Model** — Give an analogy that makes the concept easier to understand.
3. **How It Works** — Explain the internal mechanism step by step.
4. **Visual Explanation** — Include diagrams, flowcharts, or illustrations where useful.
5. **Real-World Example** — Show where the concept appears in actual software systems.
6. **Why It Matters** — Explain why backend developers need to understand it.
7. **Common Misconceptions** — Correct common misunderstandings.
8. **Related Concepts** — Link to connected lessons.
9. **Knowledge Check** — Add a few questions to test understanding.
10. **Further Reading** — Recommend useful documentation and resources.

---

# Difficulty Levels

Organize lessons into three difficulty levels.

### Beginner
Build a foundation in how computers and applications work.

- Computer Fundamentals
- CPU, RAM, and Storage
- Processes
- Threads
- Basic Memory Management
- HTTP Fundamentals
- Synchronous vs Asynchronous Programming

### Intermediate
Understand how applications handle concurrent work and manage resources.

- Stack vs Heap
- Garbage Collection
- Thread Scheduling
- Race Conditions
- Locks and Mutexes
- Event Loops
- Async I/O
- Database Transactions
- Connection Pooling

### Advanced
Explore deeper system internals and large-scale architecture.

- Virtual Memory Internals
- Operating System Scheduling Algorithms
- Memory Models
- Lock-Free Programming
- Distributed Consensus
- Database Internals
- Distributed Transactions
- Fault Tolerance
- Advanced Performance Optimization

---

# Language Independence

The Architecture Library should teach concepts independently of programming languages.

Do not make the main lessons specific to Python, JavaScript, Java, or any other language.

Instead, explain the underlying concept first.

Where implementation examples are useful, add a separate section showing how different languages handle that concept.

For example:

### Async Programming

**Core lesson:**
- What asynchronous programming means
- How event loops work
- How non-blocking I/O works
- How tasks are scheduled

**Language implementations:**
- Python — asyncio
- JavaScript — Event Loop and Promises
- Java — CompletableFuture and Virtual Threads
- Go — Goroutines and Channels
- C# — async/await and Task
- Rust — Futures and Async Runtimes

Use the same approach for memory management, concurrency, garbage collection, processes, and other concepts.

---

# Concept Relationships

The Architecture Library should work as a connected knowledge map, not just a collection of separate articles.

Create links between related topics.

### Memory Management Learning Path

Memory  
→ Stack and Heap  
→ Memory Allocation  
→ Garbage Collection  
→ Memory Leaks  
→ Resource Management  
→ Backend Performance

### Concurrency Learning Path

Processes  
→ Threads  
→ Concurrency  
→ Parallelism  
→ Race Conditions  
→ Locks and Mutexes  
→ Thread Safety

### Asynchronous Programming Learning Path

Synchronous Programming  
→ Asynchronous Programming  
→ Blocking vs Non-Blocking I/O  
→ Event Loops  
→ Coroutines  
→ Tasks and Futures  
→ Async Backend Applications

### Networking Learning Path

Computer Networks  
→ IP Addresses  
→ DNS  
→ TCP and UDP  
→ Sockets  
→ HTTP  
→ HTTPS and TLS  
→ Backend Request Lifecycle

### Database Learning Path

Database Fundamentals  
→ Indexes  
→ Transactions  
→ ACID  
→ Isolation Levels  
→ MVCC  
→ Replication  
→ Sharding

### Distributed Systems Learning Path

Client-Server Architecture  
→ Multiple Services  
→ Load Balancing  
→ Service Communication  
→ Message Queues  
→ Replication  
→ Consistency  
→ Fault Tolerance

---

# Suggested Website Features

- Expandable learning modules
- Individual lesson pages
- Beginner, Intermediate, and Advanced labels
- Estimated reading time
- Lesson completion tracking
- Search across all topics
- Related concepts section
- Visual diagrams and flowcharts
- Interactive knowledge checks
- Prerequisite links
- Learning progress indicator
- Language-specific implementation examples

---

# Relationship with Backend Journey

The Backend Journey and Architecture Library should complement each other.

**Backend Journey:**  
Teaches developers what to learn and how to build backend applications.

**Architecture Library:**  
Teaches developers why software systems work the way they do and what happens internally when applications execute.

For example:

- Backend Journey: Learn how to build an API.
- Architecture Library: Understand what happens when an API receives a request.

- Backend Journey: Learn how to use a database.
- Architecture Library: Understand indexes, transactions, locking, and database internals.

- Backend Journey: Learn asynchronous programming.
- Architecture Library: Understand event loops, concurrency, and non-blocking I/O.

---

# Final Goal

The goal of the Architecture Library is to help developers move beyond simply writing code.

By completing this library, learners should understand:

- How computers execute programs.
- How operating systems manage processes and memory.
- How threads and asynchronous tasks work.
- How applications communicate over networks.
- What happens internally during a backend request.
- How databases store, retrieve, and protect data.
- How distributed systems communicate and scale.
- How backend applications manage resources and handle failures.

**Understand the systems behind the code. Build better software.**