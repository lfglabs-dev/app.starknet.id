export const getFreeDomain = async (
  addr: string,
  domain: string,
  code: string
) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_LINK}/campaigns/get_free_domain?addr=${addr}&domain=${domain}&code=${code}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (res.status !== 200) {
      return { error: await res.text() };
    }
    return res.json();
  } catch (e) {
    console.error("Error getting free domain:", { error: e, addr, domain, code });
    return { error: e };
  }
};
