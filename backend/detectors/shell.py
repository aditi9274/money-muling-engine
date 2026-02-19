def detect_shells(G):
    shells = []
    for node in G.nodes():
        if G.degree(node) <= 3:
            for neighbor in G.successors(node):
                if G.degree(neighbor) <= 3:
                    shells.append((node, neighbor))
    return shells
