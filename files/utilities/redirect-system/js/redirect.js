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
    const url = new URL(u);

    // only http(s)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    // block possibly malware redirect (extra security)
    if (/[<>"'`]/.test(u)) {
      return false;
    }

    return true;
  } catch {
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
      location.replace(u);
    } else {
      console.warn("Unsafe redirect blocked:", u);
    }
    return;
  }

  console.warn("No redirect performed (no ?c=).");
})();
