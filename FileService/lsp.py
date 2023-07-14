import jedi
from jedi.api.classes import Completion

# Your source code
source = """
import os
os.path.exis
"""

# Create a Jedi Script object
script = jedi.Script(source)

import os

# Get the completions at the cursor position (line 3, column 13 in this case)
completions = script.complete(3, len("os.path.exis"))
import os

os.path.exists()
for completion in completions:
    completion: Completion
    print(completion.docstring(raw=True))
    print(completion.name_with_symbols)
    print(completion.complete) # The completion string
    print(completion.get_completion_prefix_length()) # The length of the prefix