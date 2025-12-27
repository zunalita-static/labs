const map = {
  "https://":"h~","http://":"p~","www.":"w~",
  ".com":".c",".org":".o",".net":".n"
};

function norm(u){
  return u.trim()
    .replace(/^https?:\/\//,"")
    .replace(/^www\./,"")
    .replace(/\/+$/,"")
    .toLowerCase();
}

function enc(u){
  u = norm(u);
  for(const [k,v] of Object.entries(map)) u = u.replaceAll(k,v);
  return btoa(u).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}

function dec(s){
  let u = atob(s.replace(/-/g,"+").replace(/_/g,"/"));
  for(const [k,v] of Object.entries(map)) u = u.replaceAll(v,k);
  if(!/^https?:\/\//.test(u)) u = "https://" + u;
  return u;
}

function isSafeRedirectUrl(u){
  try {
    const target = new URL(u, location.href);
    // Ensure the redirect stays on the same origin
    if (target.origin !== location.origin) {
      return false;
    }

    // Only allow redirects to relative or root-relative URLs to avoid
    // user-controlled absolute URLs being used for navigation.
    // Examples of allowed values for `u`:
    //   "/path", "path", "path?query", "/path?query#hash"
    // Examples of disallowed values for `u`:
    //   "http://example.com", "https://attacker.com/foo"
    const trimmed = u.trim();

    // If the user supplied an absolute URL, reject it even if it ends up
    // resolving to the same origin, so that only application-internal,
    // relative URLs are permitted.
    if (/^https?:\/\//i.test(trimmed)) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

function gen(u){
  const short = `${location.origin}${location.pathname}?c=${enc(u)}`;
  console.log("Short:", short);
  return short;
}

(()=>{
  const p = new URLSearchParams(location.search);
  const c = p.get("c");

  if (c) {
    const u = dec(c);
    console.log("→ redirect:", u);
    if (isSafeRedirectUrl(u)) {
      location.replace(u);
    } else {
      console.warn("Unsafe redirect blocked:", u);
    }
    return;
  }

  console.warn("No redirect performed (no ?c=).");
})();