# Nota a contribuyentes en Español:

Aunque este es un repo personal, hace parte del repo de `Staging`, proceso previo para hacer merge a el repo original. Esta decisión se tomó conjuntamente con @getify para reducir el ruido en el repo master, (siga conversación acá)[https://github.com/getify/You-Dont-Know-JS/pull/1378].

Sin embargo, todas contribuciones habrá un `Contributors` pages en Espanõl. 

¿Cómo hacer un PR?

1. Fork este proyecto.
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


