# Nota a contribuyentes en Español:

Aunque este es un repo personal, hace parte del repo de `Staging`, proceso previo para hacer merge a el repo original. Esta decisión se tomó conjuntamente con @getify para reducir el ruido en el repo master, [siga conversación acá](https://github.com/getify/You-Dont-Know-JS/pull/1378).

Sin embargo, todas contribuciones habrá un `Contributors` pages en Espanõl. 

# ¿Cómo hacer un PR?

1. Fork este proyecto y clonar su propio repositorio.
2. Hacer un branch nuevo `git checkout -b pr/branch-name`

> Tip: Keep your `master` branch pointing at the original repository and make
> pull requests from branches on your fork. To do this, run:
>
> ```
> git remote add upstream https://github.com/EstebanMarin/You-Dont-Know-JS.git
> git fetch upstream
> git branch --set-upstream-to=upstream/master master
> ```
>
> This will add the original repository as a "remote" called "upstream," Then
> fetch the git information from that remote, then set your local `master`
> branch to use the upstream master branch whenever you run `git pull`. Then you
> can make all of your pull request branches based on this `master` branch.
> Whenever you want to update your version of `master`, do a regular `git pull`


## PR al momento de iniciar una traducción

`Por favor hacer un PR antes de comenzar una traducción` Esto es un statement a la comunidad de que la persona va a hacer esa traducción y evitar hacer un PR cuando se termina y darce cuenta tarde de que ya alguién trabajó en eso.

La unidad mínima de traducción es en Markdown un bloque de `###` ó `##`, se deben llamar los branches con el siguiente formato: `pr/nombre_de_capitulo/#titulo/##subtema/###subtema`.
la filosofía de trabajo es: traducir el archivo, y todo trabajo pendiente se deja en inglés, para que sea claro para los colaboradores lo que hace falta por traducir.

Para este proceso se debe tener en cuenta la seccion que se tradujo con los siguientes parametros:

1. Revisar si el branch ya se encuntre de manera remota para evitar multiples ramas con nombres iguales `git branch -r`. Si el branch existe y falta terminar la traducción o desea corregirlo, hacer el pull correspondiente al branch a editar `git pull origin pr/../..`
2. Si el branch no existe, al crearlo, el nombre debe seguir la siguiente estructura teniendo en cuenta los títulos que se representan con el signo numeral (#) en el .md. Con base en lo anterior, se espera lo siguiente: `pr/nombre_de_capitulo/#titulo/##subtema/###subtema`.
3. Realizar el debido push al repositorio de su cuenta. Si ya su traducción se encuentra lista para revisión, hacer el PR para que el revisor quede notificado.
4. Si ya ha hecho varios commits y piensa subir su versión final, hacer un rebase interactivo en su local a master y dejar un solo commit con el mismo nombre del branch.

## Parametros a tener en cuenta en el momento de la traducción

Esta es una traducción hecha por contribuidores por lo que su interpretacion puede variar de acuerdo al usuario. Es importante tener en cuenta que las anectodas o pensamientos que el autor mencione, traducirlos en primera persona y los demas textos en tercera persona.

# El order de traduccíon será el siguiente


## Titles

En este momento vamos a comenzar el primer libro. Detalles de donde se va en el capitulo se detallarán acá:

* Read online (free!): ["Up & Going"](up\%20&\%20going/README.md#you-dont-know-js-up--going), Published: [Buy Now](http://www.ebooks.com/1993212/you-don-t-know-js-up-going/simpson-kyle/) in print, but the ebook format is free!
* Read online (free!): ["Scope & Closures"](scope\%20&\%20closures/README.md#you-dont-know-js-scope--closures), Published: [Buy Now](http://www.ebooks.com/1647631/you-don-t-know-js-scope-closures/simpson-kyle/)
* Read online (free!): ["this & Object Prototypes"](this\%20&\%20object\%20prototypes/README.md#you-dont-know-js-this--object-prototypes), Published: [Buy Now](http://www.ebooks.com/1734321/you-don-t-know-js-this-object-prototypes/simpson-kyle/)
* Read online (free!): ["Types & Grammar"](types\%20&\%20grammar/README.md#you-dont-know-js-types--grammar), Published: [Buy Now](http://www.ebooks.com/1935541/you-don-t-know-js-types-grammar/simpson-kyle/)
* Read online (free!): ["Async & Performance"](async\%20&\%20performance/README.md#you-dont-know-js-async--performance), Published: [Buy Now](http://www.ebooks.com/1977375/you-don-t-know-js-async-performance/simpson-kyle/)
* Read online (free!): ["ES6 & Beyond"](es6\%20&\%20beyond/README.md#you-dont-know-js-es6--beyond), Published: [Buy Now](http://www.ebooks.com/2481820/you-don-t-know-js-es6-beyond/simpson-kyle/)
