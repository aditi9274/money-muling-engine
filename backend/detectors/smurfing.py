def detect_smurfing(G):
    suspicious = []
    for node in G.nodes():
        if len(list(G.predecessors(node))) >= 10:
            suspicious.append(("fan_in", node))
        if len(list(G.successors(node))) >= 10:
            suspicious.append(("fan_out", node))
    return suspicious
