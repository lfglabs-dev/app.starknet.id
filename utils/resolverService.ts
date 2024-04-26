export function getResolverContract(domainKind: DomainKind): string {
  return domainKind === "xplorer"
    ? (process.env.NEXT_PUBLIC_XPLORER_RESOLVER_CONTRACT as string)
    : domainKind === "braavos"
    ? (process.env.NEXT_PUBLIC_BRAAVOS_RESOLVER_CONTRACT as string)
    : "";
}
