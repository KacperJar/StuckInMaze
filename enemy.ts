import * as THREE from 'three';

export class Agent {
    agentHeight : number;
    agentRadius : number;
    mesh : THREE.Mesh;
    agentGroup = new THREE.Group();

    speed = 5;

    navpath;
    groupID;

    constructor (agentHeight : number, agentRadius : number, speed : number) {
        this.agentHeight = agentHeight;
        this.agentRadius = agentRadius;
        this.mesh = new THREE.Mesh(new THREE.CylinderGeometry(agentRadius, agentRadius, agentHeight), new THREE.MeshPhongMaterial({ color: 'red'}));
        this.mesh.position.y = agentHeight / 2;

        this.agentGroup.add(this.mesh);
        this.agentGroup.position.z = 0;
        this.agentGroup.position.x = 0;
        this.agentGroup.position.y = 1;

        this.speed = speed;
    }

    findNavpath(found, pathfinding, pathfindinghelper, zone) {
        if (found.length > 0) {
            let target = found[0].point;
            const agentpos = this.agentGroup.position;
            // console.log(`agentpos: ${JSON.stringify(agentpos)}`);
            // console.log(`target: ${JSON.stringify(target)}`);

            this.groupID = pathfinding.getGroup(zone, this.agentGroup.position);
            // find closest node to agent, just in case agent is out of bounds
            const closest = pathfinding.getClosestNode(agentpos, zone, this.groupID);
            this.navpath = pathfinding.findPath(closest.centroid, target, zone, this.groupID);
            if (this.navpath) {
                // console.log(`navpath: ${JSON.stringify(navpath)}`);
                pathfindinghelper.reset();
                pathfindinghelper.setPlayerPosition(agentpos);
                pathfindinghelper.setTargetPosition(target);
                pathfindinghelper.setPath(this.navpath);
            }
        }
    }
    move(delta : number) {
        if ( !this.navpath || this.navpath.length <= 0 ) return

        let targetPosition = this.navpath[ 0 ];
        const distance = targetPosition.clone().sub( this.agentGroup.position );

        if (distance.lengthSq() > 0.05 * 0.05) {
            distance.normalize();
            // Move player to target
            this.agentGroup.position.add( distance.multiplyScalar( delta * this.speed ) );
        } else {
            // Remove node from the path we calculated
            this.navpath.shift();
        }
    }
};