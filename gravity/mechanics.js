const gravityConstant = 30;

function change(deltaTime) {
	
	// interactions
	forEachBodyPair((a, b) => {
		
		let diff = b.position.clone().sub(a.position);
		let dir = diff.clone().normalize();
		let dist = diff.length();
		let minDist = a.radius + b.radius;
			
		let pairVelocity = newVector()
			.addScaledVector(a.velocity, a.mass)
			.addScaledVector(b.velocity, b.mass)
			.divideScalar(a.mass + b.mass);
		
		let aDirSpeed = a.velocity.clone().sub(pairVelocity).dot(dir);
		
		// elastic collision
		if (dist < minDist && aDirSpeed > 0) {
			
			
			let bForce = dir.clone().multiplyScalar(2*a.mass*aDirSpeed/deltaTime);
			
			applyForcePair(bForce, a, b);
		}
		
		let gravityDist = dist > minDist ? dist : (minDist + 1/dist);
		let bGravityForce = diff.clone().setLength(-gravityConstant * a.mass * b.mass / (gravityDist * gravityDist));
		applyForcePair(bGravityForce, a, b);

	});
	
	// inertia
	bodies.forEach(x => x.position.addScaledVector(x.velocity, deltaTime));
}

function applyForcePair(bForce, a, b) {
	applyForceToBody(bForce, b);
	applyForceToBody(bForce.clone().negate(), a);
}

function applyForceToBody(force, body) {
	body.velocity.addScaledVector(force, deltaTime/body.mass);
}
