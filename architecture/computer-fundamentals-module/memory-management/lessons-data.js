const memoryLessons = [
    {
        title: "What Is Memory Management?",
        duration: "6 min",
        intro: "Memory management is the process of controlling how a computer's memory is used by programs and the operating system.",
        sections: [
            {
                heading: "Why does a computer need memory management?",
                paragraphs: [
                    "When you open an application, the computer needs somewhere to keep its instructions and the data it is currently using. That working area is memory, usually RAM.",
                    "Many programs can run at the same time. They all need memory, but the computer has a limited amount of physical RAM. Memory management coordinates how that memory is assigned, used and released.",
                    "The operating system plays a central role. It helps give processes memory, protects their memory spaces and manages how memory is used across the system."
                ],
                bullets: [
                    "Allocate memory when a program needs it.",
                    "Keep track of which memory is in use.",
                    "Protect one process from improperly accessing another process's memory.",
                    "Reclaim memory when it is no longer needed."
                ],
                callout: {
                    title: "Core idea",
                    text: "Memory management is not just about having enough RAM. It is also about organising, protecting and efficiently using memory."
                },
                diagram: ["Running programs", "Operating system", "Physical RAM"]
            },
            {
                heading: "Memory management happens at different levels",
                paragraphs: [
                    "A program may request memory through its programming language or runtime. The operating system provides the process with a virtual address space, and hardware helps translate virtual addresses into physical memory locations.",
                    "These layers work together. A programming language may manage objects, the operating system manages process memory, and the processor's memory-management hardware performs address translation."
                ]
            }
        ],
        question: "What is one major responsibility of memory management?",
        options: [
            "Managing how memory is allocated and used",
            "Increasing the physical size of the CPU",
            "Replacing the operating system",
            "Converting every program into machine code"
        ],
        answer: 0,
        explanation: "Memory management tracks memory usage, allocates memory and helps protect processes."
    },
    {
        title: "How a Program Uses Memory",
        duration: "7 min",
        intro: "A program needs memory for its instructions, variables, objects and temporary working data while it runs.",
        sections: [
            {
                heading: "From program file to running process",
                paragraphs: [
                    "A program stored on a drive is not the same thing as a running process. When you launch it, the operating system creates a process and prepares an address space for it.",
                    "The program's executable instructions and required data are made available to the process. The process also needs memory for its current state, function calls and dynamically created data.",
                    "The exact layout depends on the operating system, executable format, programming language and runtime."
                ],
                diagram: ["Program on storage", "Operating system loads it", "Running process"]
            },
            {
                heading: "Common memory areas",
                paragraphs: [
                    "A process's memory is often discussed using areas such as code, static or global data, stack and heap. This is a useful conceptual model, although real process layouts are more complex."
                ],
                bullets: [
                    "Code or text: executable instructions.",
                    "Static data: global and static variables.",
                    "Stack: function-call information and many local variables.",
                    "Heap: memory used for dynamically allocated objects and data."
                ],
                callout: {
                    title: "Important distinction",
                    text: "These are logical areas in a process's address space. They are not four separate physical RAM chips."
                }
            },
            {
                heading: "A simple example",
                code: "int total = 10;\n\nint main() {\n    int count = 5;\n    return total + count;\n}",
                paragraphs: [
                    "In this simplified example, total has static storage duration, while count is a local variable whose lifetime is associated with the function call. The compiler and runtime determine the actual implementation details."
                ]
            }
        ],
        question: "Which area is commonly used for function-call information?",
        options: ["Heap", "Stack", "Hard drive", "GPU memory"],
        answer: 1,
        explanation: "The call stack commonly stores information associated with active function calls."
    },
    {
        title: "Memory Addresses and Address Spaces",
        duration: "7 min",
        intro: "A memory address identifies a location in an address space. Programs use addresses to refer to instructions and data.",
        sections: [
            {
                heading: "What is a memory address?",
                paragraphs: [
                    "Think of memory as a large collection of locations. Each location can be identified by an address. When a program needs to access data, its instructions refer to addresses.",
                    "An address is not the data itself. It identifies where the data can be found within the relevant address space."
                ],
                callout: {
                    title: "Simple analogy",
                    text: "A street address identifies a location. A memory address identifies a location in a computer's memory address space."
                }
            },
            {
                heading: "What is an address space?",
                paragraphs: [
                    "An address space is the range of addresses that a program or process can use. Modern operating systems generally give each process its own virtual address space.",
                    "This means two processes can use the same numerical virtual address without necessarily referring to the same physical memory. The memory-management hardware and operating system maintain the mappings."
                ],
                diagram: ["Process A address space", "Operating system mappings", "Process B address space"]
            },
            {
                heading: "Why separate address spaces?",
                bullets: [
                    "Isolation: one process normally cannot directly read or overwrite another process's private memory.",
                    "Simpler program design: programs can use their own virtual address layout.",
                    "Protection: the system can enforce permissions on memory regions.",
                    "Flexibility: virtual memory can be mapped to physical pages in different ways."
                ]
            }
        ],
        question: "What does a memory address identify?",
        options: [
            "The speed of a processor",
            "A location in an address space",
            "The name of a running application",
            "The capacity of a hard drive"
        ],
        answer: 1,
        explanation: "An address identifies a location within a particular memory address space."
    },
    {
        title: "Stack Memory",
        duration: "8 min",
        intro: "The stack is a memory area commonly used to manage function calls and their temporary data.",
        sections: [
            {
                heading: "How the call stack works",
                paragraphs: [
                    "When a function is called, the program needs to remember information about that call. This can include where execution should return, function parameters and local data.",
                    "A call stack organises these active calls. A new call adds a stack frame, and returning from the function removes that frame.",
                    "The exact contents and layout of a stack frame depend on the programming language, compiler, processor architecture and calling convention."
                ],
                diagram: ["Function C · newest call", "Function B", "Function A · earlier call"]
            },
            {
                heading: "A function-call example",
                code: "def calculate():\n    result = 10\n    return result\n\ncalculate()",
                paragraphs: [
                    "When calculate is called, the runtime manages the function's execution state. In many implementations, information associated with the call is stored using the call stack.",
                    "Python uses its own runtime and object model, so this example should not be interpreted as a promise that every Python variable is stored directly in a native stack frame."
                ]
            },
            {
                heading: "Characteristics of stack allocation",
                bullets: [
                    "Function calls are naturally organised in last-in, first-out order.",
                    "Stack allocation and release are usually efficient.",
                    "Stack data is generally associated with active calls or a defined scope.",
                    "Stack space is limited; excessive recursion or very large stack allocations can cause stack overflow."
                ],
                callout: {
                    title: "Remember",
                    text: "The stack is closely connected to function execution. It is not simply a special name for all temporary memory."
                }
            }
        ],
        question: "What happens to a typical stack frame when its function returns?",
        options: [
            "It becomes a permanent file",
            "It is removed from the active call stack",
            "It is copied to the hard drive",
            "It becomes a CPU register"
        ],
        answer: 1,
        explanation: "Returning from a function removes its frame from the active call stack."
    },
    {
        title: "Heap Memory",
        duration: "8 min",
        intro: "The heap is an area used for dynamically allocated memory, often for data whose size or lifetime is not tied to a single function call.",
        sections: [
            {
                heading: "Why do programs need a heap?",
                paragraphs: [
                    "Sometimes a program cannot know in advance how much data it will need. For example, a user may upload a file, add records to a collection or create objects while the application is running.",
                    "Dynamic allocation allows memory to be requested while the program is executing. The heap is commonly used to provide this kind of storage."
                ],
                code: "items = []\n\nitems.append(\"book\")\nitems.append(\"laptop\")",
                callout: {
                    title: "Language differences",
                    text: "In Python, lists and many objects are managed by the Python runtime. In C, programmers can request and release heap memory explicitly using allocation functions."
                }
            },
            {
                heading: "Heap characteristics",
                bullets: [
                    "Supports dynamically allocated data.",
                    "Objects may outlive the function that created them.",
                    "Allocation strategies are more complex than simple stack-frame management.",
                    "Memory may be released manually or managed by a runtime such as a garbage collector."
                ]
            },
            {
                heading: "The heap is not the hard drive",
                paragraphs: [
                    "Heap memory is still part of a process's memory environment. It is not a separate storage device. The operating system and hardware manage how the process's virtual memory is backed by physical memory and, where applicable, other storage."
                ]
            }
        ],
        question: "Why is heap memory useful?",
        options: [
            "It stores the CPU's permanent instructions",
            "It supports dynamically allocated data",
            "It replaces the operating system",
            "It is the same thing as a hard drive"
        ],
        answer: 1,
        explanation: "Heap allocation is useful when data size or lifetime needs to be managed dynamically."
    },
    {
        title: "Stack vs Heap",
        duration: "7 min",
        intro: "Stack and heap are two important concepts in process memory, but they serve different purposes.",
        sections: [
            {
                heading: "Compare their roles",
                paragraphs: [
                    "The stack is commonly used for function-call management. The heap is commonly used for dynamically allocated data. Neither is universally better; they solve different problems."
                ],
                table: {
                    headers: ["Feature", "Stack", "Heap"],
                    rows: [
                        ["Common purpose", "Function calls and local execution data", "Dynamic data and objects"],
                        ["Management", "Often automatic with function calls", "Manual or runtime-managed"],
                        ["Lifetime", "Often tied to active scope or call", "Can outlive the creating function"],
                        ["Typical allocation", "Usually fast and structured", "More flexible, with allocator overhead"],
                        ["Common problem", "Stack overflow", "Leaks and fragmentation"]
                    ]
                }
            },
            {
                heading: "Example: a function creates data",
                code: "def make_message():\n    message = \"Hello\"\n    return message\n\nresult = make_message()",
                paragraphs: [
                    "The function call has execution state. The returned string remains usable after the function returns because the language runtime manages the object's lifetime appropriately.",
                    "This illustrates why source-code variables should not be casually equated with physical stack or heap locations. A language runtime and compiler may use different representations."
                ]
            },
            {
                heading: "Which should you use?",
                paragraphs: [
                    "In many high-level languages, you do not directly choose stack or heap storage for every variable. The compiler and runtime make many decisions.",
                    "Understanding the distinction still helps explain function calls, object lifetimes, memory allocation and performance."
                ]
            }
        ],
        question: "Which statement best describes the difference?",
        options: [
            "Stack is commonly used for call management; heap for dynamic allocation",
            "Stack is permanent storage; heap is temporary storage",
            "Heap is inside the CPU; stack is inside the hard drive",
            "They are exactly the same thing"
        ],
        answer: 0,
        explanation: "That is the central conceptual difference between the stack and heap."
    },
    {
        title: "Memory Allocation and Deallocation",
        duration: "8 min",
        intro: "Allocation reserves memory for use. Deallocation releases memory so it can be reused.",
        sections: [
            {
                heading: "What is allocation?",
                paragraphs: [
                    "When a program needs memory, an allocator or runtime arranges for an appropriate region to be made available. This is called memory allocation.",
                    "The program can then use the allocated region according to the rules of its language and runtime."
                ],
                diagram: ["Request memory", "Allocator finds space", "Program uses memory"]
            },
            {
                heading: "What is deallocation?",
                paragraphs: [
                    "When memory is no longer needed, it may be released. This is called deallocation. Released memory can become available for future allocations.",
                    "In languages such as C, developers commonly manage many allocations explicitly. In languages with garbage collection, the runtime can reclaim objects that are no longer reachable."
                ]
            },
            {
                heading: "Manual memory management example",
                code: "#include <stdlib.h>\n\nint main(void) {\n    int *numbers = malloc(5 * sizeof(int));\n\n    if (numbers == NULL) {\n        return 1;\n    }\n\n    free(numbers);\n    return 0;\n}",
                paragraphs: [
                    "In this C example, malloc requests space for five integers. The program checks whether allocation succeeded and then calls free when the memory is no longer needed.",
                    "After free, the program must not continue using the released allocation through that pointer. Doing so can cause undefined behaviour."
                ],
                callout: {
                    title: "Important",
                    text: "Allocation and deallocation must be coordinated. Incorrect lifetime management can cause leaks, invalid accesses and crashes."
                }
            }
        ],
        question: "What does deallocation mean?",
        options: [
            "Requesting more CPU power",
            "Releasing memory so it can be reused",
            "Saving a program to a file",
            "Moving a program to another computer"
        ],
        answer: 1,
        explanation: "Deallocation releases memory that is no longer required."
    },
    {
        title: "Virtual Memory",
        duration: "9 min",
        intro: "Virtual memory gives processes virtual address spaces and allows the operating system to manage mappings between virtual and physical memory.",
        sections: [
            {
                heading: "Why virtual memory exists",
                paragraphs: [
                    "Without virtual memory, programs would need to work directly with physical memory locations. This would make isolation, protection and flexible memory allocation much harder.",
                    "Virtual memory creates an abstraction. A process uses virtual addresses, while hardware and the operating system handle the mapping to physical memory."
                ],
                diagram: ["Process virtual addresses", "Address translation", "Physical memory"]
            },
            {
                heading: "What virtual memory provides",
                bullets: [
                    "Isolation between process address spaces.",
                    "Memory protection through access permissions.",
                    "Flexible mapping of virtual pages to physical frames.",
                    "The ability to keep some memory contents outside RAM until needed, depending on the operating system's memory policies."
                ]
            },
            {
                heading: "Does virtual memory mean extra RAM?",
                paragraphs: [
                    "No. Virtual memory is an abstraction and a memory-management mechanism, not a way to physically increase RAM.",
                    "Operating systems may use storage as backing for some virtual memory, but storage is much slower than RAM. Heavy paging can make a computer feel extremely slow."
                ],
                callout: {
                    title: "Key distinction",
                    text: "Virtual memory is not simply another name for swap space. Swap is one possible backing mechanism used by an operating system."
                }
            }
        ],
        question: "What does virtual memory primarily provide?",
        options: [
            "A virtual address space for processes",
            "A faster CPU clock",
            "More physical RAM chips",
            "A replacement for the file system"
        ],
        answer: 0,
        explanation: "Virtual memory provides processes with virtual address spaces and supports mapping and protection."
    },
    {
        title: "Physical Memory vs Virtual Memory",
        duration: "7 min",
        intro: "Physical memory refers to actual RAM. Virtual memory refers to the address-space abstraction used by processes.",
        sections: [
            {
                heading: "Physical memory",
                paragraphs: [
                    "Physical memory usually means RAM installed in the computer. It consists of real hardware memory locations that hold data and instructions while they are needed.",
                    "The operating system and hardware manage how physical memory is used."
                ]
            },
            {
                heading: "Virtual memory",
                paragraphs: [
                    "A process normally works with virtual addresses rather than directly selecting physical RAM locations.",
                    "The memory-management unit, or MMU, translates virtual addresses using structures maintained by the operating system, commonly including page tables."
                ],
                diagram: ["Virtual address", "MMU + page tables", "Physical address"]
            },
            {
                heading: "Compare the concepts",
                table: {
                    headers: ["Physical memory", "Virtual memory"],
                    rows: [
                        ["Actual RAM hardware", "Address-space abstraction"],
                        ["Uses physical addresses", "Programs use virtual addresses"],
                        ["Finite installed capacity", "Per-process address space can be much larger than currently resident RAM"],
                        ["Managed by hardware and OS", "Mapped and protected by hardware and OS"]
                    ]
                }
            }
        ],
        question: "Which component commonly performs virtual-to-physical address translation?",
        options: [
            "The monitor",
            "The memory-management unit (MMU)",
            "The keyboard",
            "The file extension"
        ],
        answer: 1,
        explanation: "The MMU performs address translation using structures such as page tables."
    },
    {
        title: "Paging and Page Tables",
        duration: "9 min",
        intro: "Paging divides virtual memory into fixed-size pages and physical memory into frames, allowing the operating system to map them flexibly.",
        sections: [
            {
                heading: "Pages and frames",
                paragraphs: [
                    "A page is a fixed-size block of virtual memory. A frame is a fixed-size block of physical memory. Their sizes match for a given paging system.",
                    "A virtual page can be mapped to a physical frame. Pages belonging to one process do not need to occupy adjacent physical frames."
                ],
                diagram: ["Virtual page 0", "Page table", "Physical frame 4"]
            },
            {
                heading: "What is a page table?",
                paragraphs: [
                    "A page table stores mapping information used to translate virtual page numbers into physical frame numbers. It can also contain permission and status information.",
                    "The operating system maintains page tables, while the processor's MMU uses them during address translation. Real systems use multi-level page tables and translation caches to make this efficient."
                ]
            },
            {
                heading: "Why paging is useful",
                bullets: [
                    "Physical memory does not need to be allocated as one continuous region for a process.",
                    "Pages can have different access permissions.",
                    "The operating system can load pages when needed.",
                    "Paging helps support virtual memory and process isolation."
                ],
                callout: {
                    title: "Do not confuse these terms",
                    text: "A page belongs to virtual memory. A frame belongs to physical memory."
                }
            }
        ],
        question: "What is a physical frame?",
        options: [
            "A fixed-size block of physical memory",
            "A function in a program",
            "A file stored on a hard drive",
            "A CPU instruction"
        ],
        answer: 0,
        explanation: "Physical memory is divided into frames that can hold virtual pages."
    },
    {
        title: "Memory Protection and Isolation",
        duration: "8 min",
        intro: "Memory protection prevents programs from accessing memory in ways they are not permitted to.",
        sections: [
            {
                heading: "Why protection matters",
                paragraphs: [
                    "Imagine several applications running at the same time. If every application could freely modify every other application's memory, a bug in one program could corrupt another program's data.",
                    "Operating systems use virtual address spaces and memory permissions to isolate processes and restrict access."
                ],
                diagram: ["Process A · private space", "Protection boundary", "Process B · private space"]
            },
            {
                heading: "Memory permissions",
                paragraphs: [
                    "Memory regions can have permissions such as read, write and execute. These permissions help control what a process may do with a region.",
                    "For example, a region containing executable instructions may be readable and executable but not writable. A region containing ordinary data may be readable and writable but not executable."
                ],
                table: {
                    headers: ["Permission", "Meaning"],
                    rows: [
                        ["Read", "The process may read the memory region"],
                        ["Write", "The process may modify the region"],
                        ["Execute", "The processor may execute instructions from the region"]
                    ]
                }
            },
            {
                heading: "What happens when access is invalid?",
                paragraphs: [
                    "If a program attempts an access that violates memory protection, the processor raises an exception. The operating system handles it, and the process may receive an error or be terminated.",
                    "On Unix-like systems, an invalid memory access can result in a segmentation fault."
                ],
                callout: {
                    title: "Important",
                    text: "Memory protection helps contain errors. It does not guarantee that every program is free from security vulnerabilities."
                }
            }
        ],
        question: "What is the main purpose of process memory isolation?",
        options: [
            "To let every process modify all memory",
            "To prevent processes from improperly accessing each other's memory",
            "To make the monitor display more colours",
            "To remove the need for RAM"
        ],
        answer: 1,
        explanation: "Isolation limits unintended or unauthorised memory access between processes."
    },
    {
        title: "Memory Leaks and Fragmentation",
        duration: "8 min",
        intro: "Poor memory management can waste memory. Two common problems are memory leaks and memory fragmentation.",
        sections: [
            {
                heading: "Memory leaks",
                paragraphs: [
                    "A memory leak occurs when a program keeps memory allocated even though it no longer needs it and cannot properly release it.",
                    "If this continues, the program's memory usage may grow. Eventually, it can reduce available memory and affect system performance."
                ],
                callout: {
                    title: "Example",
                    text: "A server that creates objects for every request but never releases or discards them may gradually consume more and more memory."
                }
            },
            {
                heading: "Memory fragmentation",
                paragraphs: [
                    "Fragmentation occurs when memory is divided into pieces in a way that makes allocation less efficient.",
                    "External fragmentation means free memory is split into separated regions. Internal fragmentation means an allocated block contains space that the program does not actually use."
                ],
                diagram: ["Used block", "Free block", "Used block", "Small free block"]
            },
            {
                heading: "How developers reduce these problems",
                bullets: [
                    "Release resources when they are no longer needed.",
                    "Use language features that manage object lifetimes safely.",
                    "Monitor memory usage over time.",
                    "Use profiling tools to investigate unexpected growth.",
                    "Avoid keeping unnecessary references to objects."
                ]
            }
        ],
        question: "What is a memory leak?",
        options: [
            "A monitor losing brightness",
            "Memory remaining allocated when it is no longer needed",
            "A CPU running at a lower clock speed",
            "A file being renamed"
        ],
        answer: 1,
        explanation: "A leak occurs when memory that is no longer needed is not properly reclaimed."
    },
    {
        title: "Garbage Collection",
        duration: "8 min",
        intro: "Garbage collection is automatic memory management that identifies objects a program can no longer reach and reclaims their memory.",
        sections: [
            {
                heading: "Why garbage collection exists",
                paragraphs: [
                    "In languages with garbage collection, developers usually do not manually free every object. Instead, the runtime tracks object reachability and reclaims memory when objects are no longer needed.",
                    "This reduces certain classes of memory-management mistakes, although it does not remove every possible memory problem."
                ],
                diagram: ["Program references", "Reachable objects", "Unreachable objects reclaimed"]
            },
            {
                heading: "Reachability",
                paragraphs: [
                    "An object is reachable if the program can still access it through references starting from recognised roots, such as active stack references or global references.",
                    "Objects that are no longer reachable can generally be collected. The exact algorithm depends on the runtime."
                ]
            },
            {
                heading: "Common garbage collection approaches",
                bullets: [
                    "Reference counting: tracks how many references point to an object.",
                    "Mark-and-sweep: identifies reachable objects and reclaims unreachable ones.",
                    "Generational collection: groups objects by age and often collects newer objects more frequently."
                ],
                callout: {
                    title: "Garbage collection is not magic",
                    text: "An application can still use too much memory if it keeps references to objects it no longer needs."
                }
            },
            {
                heading: "Example in Python",
                code: "items = [1, 2, 3]\n\nitems = None",
                paragraphs: [
                    "The list object may become eligible for reclamation if no other references point to it. The Python runtime manages memory, but this example does not mean the memory must be returned to the operating system immediately."
                ]
            }
        ],
        question: "What does a garbage collector generally look for?",
        options: [
            "Objects that are no longer reachable",
            "Files that are too large",
            "Slow internet connections",
            "Unused CPU instructions"
        ],
        answer: 0,
        explanation: "Tracing garbage collectors identify objects that cannot be reached from program roots."
    },
    {
        title: "How the OS Manages Memory",
        duration: "9 min",
        intro: "The operating system coordinates process memory, physical RAM, virtual memory and memory protection.",
        sections: [
            {
                heading: "The operating system's responsibilities",
                bullets: [
                    "Create and maintain process address spaces.",
                    "Set up and manage virtual-to-physical mappings.",
                    "Enforce memory protection and access permissions.",
                    "Manage physical memory allocation.",
                    "Handle page faults and memory pressure.",
                    "Coordinate with hardware memory-management features."
                ]
            },
            {
                heading: "What is a page fault?",
                paragraphs: [
                    "A page fault is an exception raised when a process accesses a virtual address that needs operating-system handling. It does not always mean something has gone wrong.",
                    "For example, a page may be valid but not currently present in RAM. The operating system may bring the required contents into memory and update the mapping.",
                    "If the access is invalid or not permitted, the operating system may instead report an error to the process."
                ],
                diagram: ["Process accesses page", "Page fault", "Operating system handles request"]
            },
            {
                heading: "Memory pressure",
                paragraphs: [
                    "Memory pressure occurs when the system has difficulty meeting the memory demands of running processes.",
                    "Depending on the operating system, it may reclaim caches, move less-used pages to backing storage, or take other actions. If pressure becomes severe, performance can degrade."
                ],
                callout: {
                    title: "Key idea",
                    text: "The operating system does not simply hand out RAM and forget about it. It continuously manages memory as processes run."
                }
            }
        ],
        question: "Does every page fault indicate a program error?",
        options: [
            "Yes, every page fault crashes the program",
            "No, some page faults are handled normally by the operating system",
            "Yes, it means the RAM is physically damaged",
            "No, page faults only happen during shutdown"
        ],
        answer: 1,
        explanation: "A page fault can be a normal part of demand paging and virtual memory."
    },
    {
        title: "Memory Management in Backend Applications",
        duration: "9 min",
        intro: "Backend applications manage memory while handling requests, database results, cached data and background work.",
        sections: [
            {
                heading: "A backend server uses memory too",
                paragraphs: [
                    "A backend application is a running process. It uses memory for application code, request data, database results, objects, caches and other working state.",
                    "For example, when an API receives a request, the server may parse the request body, validate input, run application logic and prepare a response. These operations use memory."
                ],
                diagram: ["Incoming request", "Application processing", "Response data"]
            },
            {
                heading: "Common sources of memory usage",
                bullets: [
                    "Request and response bodies.",
                    "Database query results.",
                    "In-memory caches.",
                    "Application objects and collections.",
                    "Background jobs and task queues.",
                    "Connections and buffers managed by libraries."
                ]
            },
            {
                heading: "A practical example",
                paragraphs: [
                    "Imagine an API endpoint that retrieves 100,000 database rows and loads all of them into memory before returning a response. This can consume much more memory than retrieving a smaller batch.",
                    "Pagination, streaming and limiting query results can reduce unnecessary memory usage."
                ],
                code: "# Conceptual example\n\n# Fetch a limited number of records\nrecords = get_records(limit=100)\n\n# Process the returned batch\nfor record in records:\n    process(record)",
                callout: {
                    title: "Backend engineering connection",
                    text: "Understanding memory helps you reason about large API responses, caching, database queries, background jobs and server capacity."
                }
            },
            {
                heading: "What should backend developers monitor?",
                bullets: [
                    "Process memory usage over time.",
                    "Memory usage under concurrent requests.",
                    "Unexpected memory growth.",
                    "Cache size and retention policies.",
                    "Large request and response payloads.",
                    "Resource cleanup and object lifetimes."
                ]
            }
        ],
        question: "Which design can help reduce memory usage in an API that returns many records?",
        options: [
            "Load every record into memory for every request",
            "Use pagination or process records in batches",
            "Store all responses forever",
            "Disable all memory management"
        ],
        answer: 1,
        explanation: "Pagination and batching avoid loading unnecessarily large amounts of data at once."
    }
];