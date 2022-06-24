const bcripty = require ('bcrypt-nodejs')



module.exports = app =>{
    const {existsOrErrror, notExistsOrError, equalsOrError} = app.api.validation

    const encryptPassword= password=>{
        const salt = bcripty.genSaltSync(10)
        return bcripty.hashSync(password, salt)
    }

    const save = async(req, res)=>{
        const user= {...req.body}
        if (req.params.id)user.id = req.params.id

        try{
            existsOrErrror(user.name, 'Nome não informado')
            existsOrErrror(user.email, 'E-mail não informado')
            existsOrErrror(user.password, 'Senha não informado')
            existsOrErrror(user.confirmPassword, 'Confirmação da senha inválida')
            equalsOrError(user.password, user.confirmPassword, 'Senhas não conferem')


            const userFromDB= await app.db('users')
            .where({email: user.email}).first()
            if (!user.id){
            notExistsOrError(userFromDB, 'Usuário já cadastrado')}
        } catch(msg){
            return res.status(400).send(msg)
        }


        user.password= encryptPassword(req.body.password)
        delete user.confirmPassword

        if(user.id){
            app.db('users')
            .update(user)
            .where({id: user.id})
            .then(_=> res.status(204).send())
            .catch(err => res.status(500).send(err))
        }else{
            app.db('users')
            .insert(user)
            .then(_=>res.status(204).send())
            .catch(_=>err.status(500).send(err))
                }
        }


        const get = (req, res)=>{
            app.db('users')
            .select('id', 'name', 'email', 'admin')
            .then(users =>res.json(users))
            .catch(err=>res.status(500).send(err))

        }

        const getById = (req, res)=>{
            app.db('users')
            .select('id', 'name', 'email', 'admin')
            .where ({id: req.params.id}).first()
            .then(users =>res.json(users))
            .catch(err=>res.status(500).send(err))

        }
        
            return{save, get, getById}


    }


