export function getResolverContract(domainKind: DomainKind): string {
  return domainKind === "xplorer"
    ? (process.env.NEXT_PUBLIC_XPLORER_RESOLVER_CONTRACT as string)
    : domainKind === "braavos"
    ? (process.env.NEXT_PUBLIC_BRAAVOS_RESOLVER_CONTRACT as string)
    : "";
}

export function getResolverCondition(
  domainKind: DomainKind
): string | undefined {
  return domainKind === "xplorer"
    ? "You can only transfer your subdomain to a Argent X wallet"
    : domainKind === "braavos"
    ? "You can only transfer your subdomain to a Braavos wallet"
    : undefined;
}
