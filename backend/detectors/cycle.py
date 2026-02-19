import networkx as nx
def detect_cycles(G):
    cycles = []
    simple_cycles = list(nx.simple_cycles(G))

    for cycle in simple_cycles:
        if 3 <= len(cycle) <= 5:
            cycles.append(cycle)
    return cycles