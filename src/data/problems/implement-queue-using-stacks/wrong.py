# Pours inbox into outbox on every pop and peek, even while outbox still holds
# older items, so newer items jump the queue.
class MyQueue:

    def __init__(self):
        self.inbox = []
        self.outbox = []

    def _pour(self):
        while self.inbox:
            self.outbox.append(self.inbox.pop())

    def push(self, x):
        self.inbox.append(x)

    def pop(self):
        self._pour()
        return self.outbox.pop()

    def peek(self):
        self._pour()
        return self.outbox[-1]

    def empty(self):
        return not self.inbox and not self.outbox
