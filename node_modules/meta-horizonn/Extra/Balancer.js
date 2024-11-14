class APILoadBalancer {
    constructor(APIV1, APIV2 , preferredRatio = 0.85, forceType2) {
        this.APIV1 = APIV1;
        this.APIV2 = APIV2;
        this.preferredRatio = preferredRatio; 
        this.totalRequests = 0;
        this.APIV2Requests = 0;
    }

    async makeRequest(requestData) {
        try {
            this.totalRequests++;
            const currentRatio = this.APIV2Requests / this.totalRequests;

            if (currentRatio < this.preferredRatio) {
                this.APIV2Requests++;
                return await this.APIV2(...requestData)
            } else {
                return await this.APIV1(...requestData);
            }
        } catch (error) {
            return await this.fallbackRequest(requestData);
        }
    }

    async fallbackRequest(requestData) {
        try {
            if (this.APIV2Requests / this.totalRequests >= this.preferredRatio) {
                this.APIV2Requests++;
                return await this.APIV2(...requestData);
            } else {
                return await this.APIV1(...requestData);
            }
        } catch (error) {
            throw new Error('Balancer Error, contact fb.com/Lazic.Kanzu');
        }
    }

    getStats() {
        return {
            totalRequests: this.totalRequests,
            apiv2Requests: this.APIV2Requests,
            apiv1Requests: this.totalRequests - this.APIV2Requests,
            currentRatio: (this.APIV2Requests / this.totalRequests) * 100
        };
    }
}

module.exports = APILoadBalancer;