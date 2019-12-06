let SessionLoad = 1
let s:so_save = &so | let s:siso_save = &siso | set so=0 siso=0
let v:this_session=expand("<sfile>:p")
silent only
cd ~\thinkfulprojects\ChoreRunner-API
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
set shortmess=aoO
badd +0 term://.//14216:C:\Windows\system32\cmd.exe
badd +10 term://.//24280:C:\Windows\system32\cmd.exe
badd +157 src\households\households-service.js
badd +468 src\households\households-router.js
badd +0 ~\thinkfulprojects\ChoreRunner-Client\src\components\MemberDashboard\MemberDashboard.js
argglobal
%argdel
edit ~\thinkfulprojects\ChoreRunner-Client\src\components\MemberDashboard\MemberDashboard.js
set splitbelow splitright
wincmd _ | wincmd |
vsplit
1wincmd h
wincmd w
wincmd _ | wincmd |
split
wincmd _ | wincmd |
split
2wincmd k
wincmd _ | wincmd |
vsplit
1wincmd h
wincmd w
wincmd w
wincmd w
set nosplitbelow
set nosplitright
wincmd t
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
exe 'vert 1resize ' . ((&columns * 55 + 83) / 166)
exe '2resize ' . ((&lines * 26 + 24) / 49)
exe 'vert 2resize ' . ((&columns * 75 + 83) / 166)
exe '3resize ' . ((&lines * 26 + 24) / 49)
exe 'vert 3resize ' . ((&columns * 34 + 83) / 166)
exe '4resize ' . ((&lines * 12 + 24) / 49)
exe 'vert 4resize ' . ((&columns * 110 + 83) / 166)
exe '5resize ' . ((&lines * 7 + 24) / 49)
exe 'vert 5resize ' . ((&columns * 110 + 83) / 166)
argglobal
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let s:l = 19 - ((14 * winheight(0) + 23) / 47)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
19
normal! 0
wincmd w
argglobal
if bufexists("src\households\households-router.js") | buffer src\households\households-router.js | else | edit src\households\households-router.js | endif
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let s:l = 419 - ((14 * winheight(0) + 13) / 26)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
419
normal! 0
wincmd w
argglobal
if bufexists("src\households\households-service.js") | buffer src\households\households-service.js | else | edit src\households\households-service.js | endif
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let s:l = 160 - ((10 * winheight(0) + 13) / 26)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
160
normal! 04|
wincmd w
argglobal
if bufexists("term://.//24280:C:\Windows\system32\cmd.exe") | buffer term://.//24280:C:\Windows\system32\cmd.exe | else | edit term://.//24280:C:\Windows\system32\cmd.exe | endif
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
let s:l = 361 - ((3 * winheight(0) + 6) / 12)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
361
normal! 057|
wincmd w
argglobal
if bufexists("term://.//14216:C:\Windows\system32\cmd.exe") | buffer term://.//14216:C:\Windows\system32\cmd.exe | else | edit term://.//14216:C:\Windows\system32\cmd.exe | endif
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
let s:l = 18 - ((6 * winheight(0) + 3) / 7)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
18
normal! 0
wincmd w
2wincmd w
exe 'vert 1resize ' . ((&columns * 55 + 83) / 166)
exe '2resize ' . ((&lines * 26 + 24) / 49)
exe 'vert 2resize ' . ((&columns * 75 + 83) / 166)
exe '3resize ' . ((&lines * 26 + 24) / 49)
exe 'vert 3resize ' . ((&columns * 34 + 83) / 166)
exe '4resize ' . ((&lines * 12 + 24) / 49)
exe 'vert 4resize ' . ((&columns * 110 + 83) / 166)
exe '5resize ' . ((&lines * 7 + 24) / 49)
exe 'vert 5resize ' . ((&columns * 110 + 83) / 166)
tabnext 1
if exists('s:wipebuf') && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20 winminheight=1 winminwidth=1 shortmess=I
let s:sx = expand("<sfile>:p:r")."x.vim"
if file_readable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &so = s:so_save | let &siso = s:siso_save
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
