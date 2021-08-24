from threading import Thread


class Context:
    def __init__(self) -> None:
        self.thread: Thread = None
        self.running = True
        