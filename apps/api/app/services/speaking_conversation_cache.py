"""One private help bundle per connection, shared by concurrent requests for its context."""
import asyncio


def help_context_key(document, question, target, support, target_revision, epoch):
    ref = question['current']
    return (epoch, question['id'], question['context_version'], ref['message_id'], ref['revision'],
            ref['start'], ref['end'], ref['quote'], target, target_revision,
            (support['level'], support['version']) if support else None,
            tuple((m['id'], m['revision'], m['status']) for m in document.get('messages', [])[-6:]))


class ConversationHelpCache:
    def __init__(self):
        self.key = None
        self.task = None

    def clear(self):
        if self.task and not self.task.done():
            self.task.cancel()
        self.key = self.task = None

    def peek(self, key):
        task = self.task
        if self.key == key and task and task.done() and not task.cancelled() and task.exception() is None:
            return task.result()
        return None

    async def get(self, key, create):
        if self.key != key or self.task is None:
            self.clear()
            self.key, self.task = key, create()
        task = self.task
        try:
            return await asyncio.shield(task)
        except asyncio.CancelledError:
            if self.task is task and task.cancelled():
                self.clear()
            raise
        except Exception:
            if self.task is task:
                self.clear()  # Failures are retryable, never cached as successful wording.
            raise
