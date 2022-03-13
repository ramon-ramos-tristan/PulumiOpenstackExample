import * as pulumi from "@pulumi/pulumi";
import * as os from "@pulumi/openstack";

const fs = require('fs')

const webAccess = new os.networking.SecGroup("webAccess", {
	description: "Web security group"
})

const port80 = new os.networking.SecGroupRule("port80", {
	description: "HTTP",
    direction: "ingress",
    ethertype: "IPv4",
    portRangeMax: 80,
    portRangeMin: 80,
    protocol: "tcp",
    remoteIpPrefix: '0.0.0.0/0',
    securityGroupId: webAccess.id,
});

// Create an OpenStack resource (Compute Instance)
const instance = new os.compute.Instance("test", {
	flavorName: "small",
	imageName: "ubuntu-focal-20.04",
	keyPair: "Base",
	availabilityZone: "nova",
	userData: fs.readFileSync('./install_apache.sh', 'utf8'),
	securityGroups: ["default", webAccess.name]
});

// Export the IP of the instance
export const instanceIP = instance.accessIpV4;

const floatingIP = new os.compute.FloatingIp("pruebaIP", {
    pool: "externa",
});

const FloatingIpAssociate = new os.compute.FloatingIpAssociate("fipa_1", {
    floatingIp: floatingIP.address,
    instanceId: instance.id,
});

const volumenPrueba = new os.blockstorage.Volume("Volumen_prueba", {
    description: "Volumen creado con Pulumi",
    size: 1,
});

const asociarVolumenPrueba = new os.compute.VolumeAttach("asociarVPrueba", {
    instanceId: instance.id,
    volumeId: volumenPrueba.id,
});

export const floatingIPAddress =  floatingIP.address
