class MyQueue:

    def __init__(self):
        self.inbox = []     # new items land here; its top is the newest item
        self.outbox = []    # items wait here in serving order; its top is the oldest

    def push(self, x: int) -> None:
        self.inbox.append(x)

    def pop(self) -> int:
        self.peek()                 # makes sure the front item is on top of outbox
        return self.outbox.pop()

    def peek(self) -> int:
        if not self.outbox:
            # Refill only when outbox is empty. Pouring reverses the order, so the
            # oldest item in inbox lands on top. If outbox still held anything,
            # those items are older and must be served first.
            while self.inbox:
                self.outbox.append(self.inbox.pop())
        return self.outbox[-1]

    def empty(self) -> bool:
        return not self.inbox and not self.outbox
