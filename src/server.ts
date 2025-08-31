    import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
    import { 
    StdioServerTransport 
    } from "@modelcontextprotocol/sdk/server/stdio.js";
    import { writeFile } from "fs/promises";

    import {z} from 'zod'
    const server = new McpServer({
        name: "test-server",
        version: "1.0.0"
    }, {
        capabilities: {
        resources: {},
        tools: {},
        }
    });

    server.tool("create-user","create a new use in database",{
        name:z.string(),
        email:z.string(),
        phone:z.string(),
        address:z.string(),
    },{
        title:"Create User",
        readOnlyHint:false,
        idempotentHint:false,
        openWorldHint:true,
    },async (params)=>{
        try {
            const id = await createUser(params);
            return {
                content:[
                    {
                        type:"text", text:`user created successfully: ${id}`
                    }
                ]
            }
        } catch (error) {
            return {
                content:[
                    {
                        type:"text", text:"failed to save user"
                    }
                ]
            }
        }
        return {}
    }) 

    async function createUser(user:{
        name:string,
        email:string,
        address:string,
        phone:string
    }){
    const users = await import("./data/users.json", {
      with: { type: "json" },
    }).then(m => m.default)
        const id = users.length +1;
        users.push({id, ...user})
        await writeFile("./src/data/users.json",JSON.stringify(users,null,2)) 
        return id;
    }

    async function main(){
    const transport = new StdioServerTransport();
    await server.connect(transport); 
    }

    main();