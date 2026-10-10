# The list is built from (values, pos) here: a tail that points back into the
# list can't be written as plain data, so the function never sees `pos`.

def run(fn, args):
    values, pos = args
    head = to_list_node(values)
    if pos >= 0:
        nodes = []
        node = head
        while node:
            nodes.append(node)
            node = node.next
        nodes[-1].next = nodes[pos]
    return fn(head)
