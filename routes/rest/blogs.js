

module.exports ={
    async post(req,res){
        try {
            const {id} = req.user;
            const {title, thumbnail,content,attachments,category,tags }= req.body;

            if(!title) return res.status(400).json({ error: true, message: "Missing mandatory field `title`" });

            
        } catch (error) {
            return res.status(400).json({ error: true, message: error.message });
        }
    }
}