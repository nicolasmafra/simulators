const elasticConstant = 1000;
const gravityConstant = 100;

function change(deltaTime) {
	
	// inertia
	bodies.forEach(x => x.position.addScaledVector(x.velocity, deltaTime));
	
	// interactions
	forEachBodyPair((a, b) => {
		
		let diff = b.position.clone().sub(a.position);
		let dist = diff.length() + 0.1;
		let minDist = a.radius + b.radius;
		
		// spring collision
		if (dist < minDist) {
			
			let overlap = minDist - dist;
			let bForce = diff.clone().setLength(elasticConstant * overlap);
			
			applyForcePair(bForce, a, b);
		}
		
		let bGravityForce = diff.clone().setLength(gravityConstant * a.mass * b.mass / (dist * dist));
		applyForceToBody(bGravityForce, a, b);

	});
}

function applyForcePair(bForce, a, b) {
	applyForceToBody(bForce, b);
	applyForceToBody(bForce.clone().negate(), a);
}

function applyForceToBody(force, body) {
	body.velocity.addScaledVector(force, deltaTime/body.mass);
}