
import json
from datetime import datetime

MEMORY_FILE = "memory.json"

def load_memories():
    """Loads memories from the memory file."""
    try:
        with open(MEMORY_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_memories(memories):
    """Saves memories to the memory file."""
    with open(MEMORY_FILE, "w") as f:
        json.dump(memories, f, indent=4)

def add_memory(memory_text, memories):
    """Adds a new, unique, and positive memory."""
    # Simple check for uniqueness
    for mem in memories:
        if mem["memory"] == memory_text:
            return False  # Not unique

    # Add the new memory
    memories.append({
        "memory": memory_text,
        "timestamp": datetime.now().isoformat()
    })
    save_memories(memories)
    return True
