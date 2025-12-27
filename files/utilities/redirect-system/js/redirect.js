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
    const trimmed = u.trim();

    // Disallow obvious dangerous characters and whitespace-only values
    if (!trimmed || /[\s<>"'`]/.test(trimmed)) {
      return false;
    }

    // Reject protocol-relative URLs and explicit schemes
    if (/^(?:[a-zA-Z][a-zA-Z0-9+.-]*:)?\/\//.test(trimmed)) {
      return false;
    }

    // Allow only relative or root-relative URLs (no scheme/host in input)
    const target = new URL(trimmed, location.origin);

    // Ensure the redirect stays on the same origin
    if (target.origin !== location.origin) {
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
      const safeTarget = new URL(u.trim(), location.origin);
      location.replace(safeTarget.toString());
    } else {
      console.warn("Unsafe redirect blocked:", u);
    }
    return;
  }

  console.warn("No redirect performed (no ?c=).");
})();