export const STORAGE_KEY = "ga-lang";

/**
 * Runs before React loads, so Arabic pages are right-to-left from the very
 * first paint. Mirrors `detect()`.
 */
export const LANG_BOOT_SCRIPT = `(function(){try{var d={en:"ltr",tr:"ltr",ar:"rtl"};var l=localStorage.getItem("${STORAGE_KEY}");if(!d[l]){l="en";var n=navigator.languages||[navigator.language];for(var i=0;i<n.length;i++){var b=(n[i]||"").slice(0,2).toLowerCase();if(d[b]){l=b;break}}}document.documentElement.lang=l;document.documentElement.dir=d[l]}catch(e){}})()`;
