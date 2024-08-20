
export default {
    async fetch(request, env) {
        // Replace text from the title element
        class TitleRewriter {
            constructor() {
                this.alreadyInsertedOnce = false;
                this.originalText = "";
            }

            text(text) {
                this.originalText = this.originalText + text.text;
                text.remove();
                if (text.lastInTextNode && !this.alreadyInsertedOnce) {
                    this.alreadyInsertedOnce = true;
                    text.after(this.originalText.replace("Azeez", "Testing"));
                }
            }
        }

        // Include declaration of the manifest.json file in the head
        class ManifestRewriter {
            element(element) {
                if (element.tagName == "head") {
                    element.prepend('<link rel="manifest" href="/manifest.json"></link>', { html: true })
                }
            }
        }

        // Overwrite the release number from origin
        // <p class="releaseNumber"><span title="RELEASE_TITLE">Release RELEASE_NUMBER</span><p>
         class ReleaseRewriter {
            constructor() {
                this.alreadyInsertedOnce = false;
            }

            text(text) {
                console.log("Text found");
                if (text.lastInTextNode && !this.alreadyInsertedOnce) {
                    this.alreadyInsertedOnce = true;
                    text.remove();
                    text.after("Release " + env.RELEASE_NUMBER);
                } else {
                    text.remove();
                }
            }
        }

        // Overwrite the release title from origin
        // <p class="releaseNumber"><span title="RELEASE_TITLE">Release RELEASE_NUMBER</span><p>
        class ReleaseTitleRewriter {
            element(element) {
                if (env.RELEASE_TITLE != "") {
                    element.setAttribute("title", env.RELEASE_TITLE);
                }
            }
        }

        const rewriter = new HTMLRewriter()
            .on('p[class="releaseNumber"] span', new ReleaseTitleRewriter())
            .on('p[class="releaseNumber"]', new ReleaseRewriter())
            .on("head", new ManifestRewriter())
            .on("title", new TitleRewriter());

        const res = await fetch(request);
        const contentType = res.headers.get("Content-Type");

        // If the response is HTML, it can be transformed with
        // HTMLRewriter -- otherwise, it should pass through
        if (contentType && contentType.startsWith("text/html")) {
            return rewriter.transform(res);
        } else {
            return res;
        }
    }
}
